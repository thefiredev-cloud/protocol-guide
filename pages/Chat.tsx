
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { protocols } from '../data/protocols';
import { useWidgetMode } from '../contexts/WidgetModeContext';
import { useChat, type Message, type CitationLink } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceInput } from '../contexts/VoiceInputContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FeedbackButtons } from '../components/FeedbackButtons';
import { QuickResults, extractRelevantSnippet, type LocalSearchResult } from '../components/QuickResults';
import { QuickActions } from '../components/QuickActions';

// Dev mode detection - use direct API on localhost
const isDevMode = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Persistence imports for QA/QI tracking
import {
  createChatSession,
  persistMessage,
  endSession,
  type SessionMetadata,
  type MessagePersistenceData,
} from '../lib/chat-persistence';

// RAG imports - use when Supabase is configured
import {
  retrieveContext,
  formatContextForAI,
  formatPatientContext,
  getConfidenceLevel,
  validateGrounding,
  createCitationLinks,
  enhanceResponseWithCitations,
  isDeclineResponse,
  type RetrievalResult,
  type PatientContext,
} from '../lib/rag';

// Conversation fact extraction for follow-up questions
import {
  extractFactsFromMessage,
  suggestFollowUp,
  formatFactsForPrompt,
  isContextDependentMessage,
  detectClarifyingQuestion,
  formatPriorContext,
  type ConversationFacts,
  type PendingClarification,
} from '../lib/conversation';

// Message and CitationLink interfaces imported from ChatContext

// Grounded System Prompt for Zero Hallucination
const GROUNDED_SYSTEM_PROMPT = `ROLE: Protocol-Guide (LA County Fire EMS Medical Reference)

CRITICAL SAFETY REQUIREMENT: You are a medical reference system for emergency responders.
Your responses directly impact patient care. ACCURACY IS PARAMOUNT.

AUTHORIZED SOURCE RESTRICTION:
All protocol information MUST originate from the LA County DHS Emergency Medical Services Agency
Prehospital Care Manual (https://dhs.lacounty.gov/emergency-medical-services-agency/).
Do NOT use information from other EMS systems, states, or jurisdictions.
LA County-specific protocols may differ from NAEMSP, AHA, or other national guidelines.
If user asks about protocols from other regions, state: "I only have access to LA County EMS protocols."

STRICT GROUNDING RULES:
1. ONLY answer using the PROTOCOL CONTEXT provided below. Do not use any external knowledge.
2. The context is sourced EXCLUSIVELY from LA County DHS EMS protocols.
3. If the context does not contain information to answer the question, respond with:
   "I don't have specific LA County EMS protocol information for this query. Please consult the full protocol manual or contact medical control."
4. NEVER invent, assume, or extrapolate dosages, procedures, or clinical guidance.
5. ALWAYS cite the specific protocol reference (e.g., "Per TP-1201:" or "Ref: MCG 1302")
6. If multiple protocols apply, list all relevant references.

VERBATIM REQUIREMENTS (CRITICAL FOR CLINICAL ACCURACY):
- For ALL clinical facts, quote EXACT text from the protocol context
- NEVER paraphrase or summarize the following - always quote verbatim:
  * Medication dosages (mg, mcg, mL, mg/kg)
  * Procedure steps and technique details
  * Clinical criteria and decision thresholds
  * Time windows and intervals
  * Contraindications and precautions
- Format verbatim quotes with the protocol reference: "Per TP-1201: [exact text]"
- If you cannot quote verbatim for clinical content, state: "Protocol context does not contain specific [dosage/criteria/etc.]"

CONVERSATION BEHAVIOR:
1. When a query lacks critical clinical details, ASK ONE focused clarifying question.
2. For trauma/wound queries: ask injury LOCATION if not specified.
   - Proximal wounds (above knee/elbow) = higher risk, may require base contact
3. For stroke queries: ask for LAMS score or LKWT if not specified.
4. Use facts from prior messages (shown in ESTABLISHED FACTS) to inform responses.
5. If ESTABLISHED FACTS indicate BASE CONTACT REQUIRED, prominently state this.

RESPONSE STYLE (CRITICAL):
- Write SHORT sentences: 4-5 words maximum.
- Use punchy, direct language. Responders need quick reads.
- Example:
  BAD: "The recommended adult dose of epinephrine for anaphylaxis is 0.3mg IM."
  GOOD: "Adult epi: 0.3mg IM. Give lateral thigh. May repeat q5-15min."
- Use bullet points for lists.
- Do NOT use markdown bold (**text**).
- Always cite: "Per TP-1201:"
- Flag uncertainties: "Verify with medical control."
- Exception: Verbatim protocol quotes may exceed 5 words.

CONFIDENCE INDICATOR:
- If CONFIDENCE is LOW, prepend response with: "Limited protocol match. Verify with protocol manual."
`;

// Decline response for when we can't answer
const DECLINE_RESPONSE = `I don't have specific protocol information that matches your query.

Recommended actions:
• Check the Protocol Browser for related topics
• Consult the full LA County EMS Protocol Manual
• Contact Base Hospital for real-time medical direction`;

const Chat: React.FC = () => {
  // Local ephemeral state
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [quickResults, setQuickResults] = useState<LocalSearchResult[]>([]);
  const [showQuickResults, setShowQuickResults] = useState(false);
  const [quickResultsFading, setQuickResultsFading] = useState(false);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionCreatedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Batched streaming updates - accumulate chunks before re-rendering (RAF for 60fps)
  const pendingTextRef = useRef('');
  const updateRafRef = useRef<number | null>(null);

  // Auth context for user info
  const { user, isAuthenticated } = useAuth();

  // Persistent state from ChatContext (survives route changes)
  const {
    messages,
    setMessages,
    conversationFacts,
    updateFacts,
    pendingClarification,
    setPendingClarification,
    isTyping,
    setTyping,
    useRAG,
    setUseRAG,
    addMessage,
    startNewSession,
  } = useChat();

  // Menu dropdown state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleClearChat = () => {
    if (messages.length > 1 && !confirm('Clear all messages and start a new conversation?')) {
      return;
    }
    startNewSession();
    setShowMenu(false);
  };

  const { patientContext, isWidgetMode } = useWidgetMode();

  // Create Supabase session on mount when user is authenticated
  useEffect(() => {
    const initDbSession = async () => {
      if (!isAuthenticated || !user || sessionCreatedRef.current || !isSupabaseConfigured()) {
        return;
      }

      sessionCreatedRef.current = true;

      const metadata: SessionMetadata = {
        userId: user.email,
        userEmail: user.email,
        station: user.station,
        department: user.department,
        patientContextActive: !!patientContext,
      };

      const sessionId = await createChatSession(metadata);
      if (sessionId) {
        setDbSessionId(sessionId);
      }
    };

    initDbSession();
  }, [isAuthenticated, user, patientContext]);

  // End session on unmount
  useEffect(() => {
    return () => {
      if (dbSessionId) {
        endSession(dbSessionId);
      }
    };
  }, [dbSessionId]);

  // Voice input integration
  const { transcript, interimTranscript, isListening, clearTranscript } = useVoiceInput();

  // Auto-fill input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      // Focus input after voice transcription
      inputRef.current?.focus();
    }
  }, [transcript]);

  // Show interim transcript while listening
  useEffect(() => {
    if (isListening && interimTranscript) {
      setInput(interimTranscript);
    }
  }, [interimTranscript, isListening]);

  // Clear transcript after sending
  const handleClearVoice = () => {
    clearTranscript();
  };

  // Check if RAG is available (Supabase configured)
  useEffect(() => {
    setUseRAG(isSupabaseConfigured());
  }, []);

  // Check if user is near bottom of chat (within 150px)
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 150;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Scroll to bottom - instant during streaming, smooth otherwise
  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? 'instant' : 'smooth',
      block: 'end'
    });
  };

  // Auto-scroll only if user is near bottom (don't interrupt reading)
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom(isStreaming);
    }
  }, [messages, isTyping, isStreaming]);

  // When streaming starts, scroll to show the new message at BOTTOM of viewport (smooth, non-interrupting)
  useEffect(() => {
    if (isStreaming && streamingMessageId) {
      const msgElement = document.getElementById(`msg-${streamingMessageId}`);
      if (msgElement) {
        msgElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [streamingMessageId]);

  // Helper to strip HTML and clean text
  const stripHtml = (s?: string) => s ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';

  // Client-side Retrieval Function
  const getRelevantContext = (query: string): string => {
    if (!query.trim()) return '';
    
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (terms.length === 0) return '';

    // Score protocols based on relevance
    const scored = protocols.map(p => {
      let score = 0;
      const searchableString = JSON.stringify(p).toLowerCase();
      const titleLower = p.title.toLowerCase();
      const refNoLower = p.refNo.toLowerCase();

      // HIGHEST priority: Exact or near-exact title/refNo match
      if (refNoLower === query.toLowerCase() || titleLower === query.toLowerCase()) score += 500;
      if (refNoLower.includes(query.toLowerCase())) score += 200;
      if (titleLower.includes(query.toLowerCase())) score += 150;

      // High priority: Term matches in title/refNo (medication names, protocol numbers)
      terms.forEach(term => {
        if (titleLower === term) score += 100; // Exact term = title
        if (titleLower.includes(term)) score += 40;
        if (refNoLower.includes(term)) score += 30;
        if (p.category.toLowerCase().includes(term)) score += 10;
        if (searchableString.includes(term)) score += 2;
      });

      return { p, score };
    });

    // Select top 3 most relevant protocols
    const topProtocols = scored
      .filter(x => x.score > 5) // Filter out noise
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const results = topProtocols.map(x => x.p);
    if (results.length === 0) return '';

    // Format them for the AI
    return results.map(p => {
      const content = p.sections.map(s => {
        if (s.type === 'header') return '';
        const text = s.content ? stripHtml(s.content) : '';
        const items = s.items?.map(i => {
           const t = i.title ? i.title : '';
           const c = i.content ? `: ${stripHtml(i.content)}` : '';
           return `${t}${c}`;
        }).join('; ') || '';
        const label = s.title ? `[${s.title}]` : `[${s.type}]`;
        return `${label} ${text} ${items}`.trim();
      }).filter(Boolean).join(' | ');
      return `PROTOCOL_REF:${p.refNo} TITLE:${p.title} CATEGORY:${p.category} :: CONTENT:${content}`;
    }).join('\n\n');
  };

  // Get local search results for QuickResults preview
  const getLocalSearchResults = (query: string): LocalSearchResult[] => {
    if (!query.trim()) return [];

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (terms.length === 0) return [];

    const scored = protocols.map(p => {
      let score = 0;
      const searchableString = JSON.stringify(p).toLowerCase();
      const titleLower = p.title.toLowerCase();
      const refNoLower = p.refNo.toLowerCase();

      if (refNoLower === query.toLowerCase() || titleLower === query.toLowerCase()) score += 500;
      if (refNoLower.includes(query.toLowerCase())) score += 200;
      if (titleLower.includes(query.toLowerCase())) score += 150;

      terms.forEach(term => {
        if (titleLower === term) score += 100;
        if (titleLower.includes(term)) score += 40;
        if (refNoLower.includes(term)) score += 30;
        if (p.category.toLowerCase().includes(term)) score += 10;
        if (searchableString.includes(term)) score += 2;
      });

      return { p, score };
    });

    return scored
      .filter(x => x.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => ({
        protocolRef: x.p.refNo,
        title: x.p.title,
        category: x.p.category,
        matchedContent: extractRelevantSnippet(x.p, query),
        score: x.score,
      }));
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initMessage = useRAG
        ? 'LA County protocols indexed. Ready for field reference.'
        : 'Protocol-Guide Active. Ready for rapid retrieval.';

      setMessages([{
        id: 'init-1',
        role: 'assistant',
        content: initMessage,
        timestamp: new Date()
      }]);
    }
  }, [useRAG]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Guard against concurrent requests - abort previous if streaming
    if (isStreaming) {
      console.warn('Request blocked: already streaming');
      return;
    }

    // Set streaming flag IMMEDIATELY to prevent race condition from rapid clicks
    setIsStreaming(true);

    const originalInput = input; // Keep original for UI

    // Show quick results immediately (0-200ms) while AI processes
    const localResults = getLocalSearchResults(originalInput);
    if (localResults.length > 0) {
      setQuickResults(localResults);
      setShowQuickResults(true);
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: originalInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    handleClearVoice(); // Clear voice transcript after sending
    setTyping(true);

    // Track request start time for response time metrics
    const requestStartTime = Date.now();

    // Persist user message to Supabase for QA/QI tracking
    if (dbSessionId) {
      persistMessage({
        sessionId: dbSessionId,
        role: 'user',
        content: originalInput,
      });
    }

    // Extract clinical facts from user message for conversation context
    const updatedFacts = extractFactsFromMessage(originalInput, conversationFacts);
    updateFacts(updatedFacts);

    // Check if we should suggest a follow-up question
    const followUpSuggestion = suggestFollowUp(updatedFacts);

    try {
      let retrieval: RetrievalResult | null = null;
      let context = '';
      let patientInfo = '';
      let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

      // Check for context-dependent responses (yes/no) BEFORE RAG retrieval
      // If user is responding to a clarifying question, don't let RAG decline
      const isContextDependent = isContextDependentMessage(originalInput);
      const lastAssistantMsg = messages.length >= 2
        ? [...messages].reverse().find(m => m.role === 'assistant')
        : null;
      const activeClarification = pendingClarification ||
        (lastAssistantMsg ? detectClarifyingQuestion(lastAssistantMsg.content) : null);

      // Log context-dependent detection
      if (isContextDependent) {
        console.log('[Chat] Context-dependent message detected pre-RAG:', {
          input: originalInput,
          hasClarification: !!activeClarification,
          clarificationTopic: activeClarification?.topic,
        });
      }

      // Use RAG pipeline if available, otherwise fallback to local search
      if (useRAG) {
        // RAG Pipeline: Retrieve context from Supabase with vector search
        // Pass conversation facts to enable query enhancement ("5" → "LAMS score 5 stroke...")
        retrieval = await retrieveContext(originalInput, patientContext as PatientContext, {
          conversationFacts: updatedFacts,
        });

        // Check if we should decline to answer
        // IMPORTANT: Don't decline if this is a context-dependent response to a clarifying question
        const shouldBypassDecline = isContextDependent && activeClarification !== null;
        if (retrieval.shouldDecline && !shouldBypassDecline) {
          const declineMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: DECLINE_RESPONSE,
            timestamp: new Date(),
            confidence: 'LOW',
            isWarning: true,
          };
          setMessages(prev => [...prev, declineMsg]);

          // Persist decline response for QA/QI tracking
          if (dbSessionId) {
            persistMessage({
              sessionId: dbSessionId,
              role: 'assistant',
              content: DECLINE_RESPONSE,
              confidenceLevel: 'LOW',
              responseTimeMs: Date.now() - requestStartTime,
              isDeclineResponse: true,
              hasWarning: true,
            });
          }

          setTyping(false);
          setIsStreaming(false);
          return;
        }

        context = formatContextForAI(retrieval);
        confidenceLevel = getConfidenceLevel(retrieval.confidence);
      } else {
        // Fallback: Use local keyword search
        context = getRelevantContext(originalInput);
      }

      // Get patient context
      patientInfo = formatPatientContext(patientContext as PatientContext);

      // Construct augmented prompt with confidence indicator and conversation facts
      const confidenceInstruction = confidenceLevel === 'LOW'
        ? '\nCONFIDENCE: LOW - Prepend warning to response.\n'
        : confidenceLevel === 'MEDIUM'
        ? '\nCONFIDENCE: MEDIUM - Cite sources carefully.\n'
        : '\nCONFIDENCE: HIGH - Multiple strong matches found.\n';

      // Format conversation facts for context
      const factsContext = formatFactsForPrompt(updatedFacts);

      // Include follow-up suggestion if applicable - make it directive
      const followUpInstruction = followUpSuggestion
        ? `\nREQUIRED FOLLOW-UP: You MUST ask the user "${followUpSuggestion.question}" before providing specific protocol recommendations. Reason: ${followUpSuggestion.reason}. Do not skip this clarifying question.\n`
        : '';

      // NOTE: Raw conversation history removed to prevent context bleeding.
      // Clinical facts are preserved via factsContext (extracted structured data).
      // This prevents unrelated queries (e.g., GSW then Narcan) from mixing.
      // HOWEVER: For context-dependent responses (yes/no/confirmations), we inject prior context.

      // Use already-computed values from pre-RAG check (isContextDependent, lastAssistantMsg, activeClarification)
      let priorContextString = '';

      if (isContextDependent && lastAssistantMsg) {
        priorContextString = formatPriorContext(lastAssistantMsg.content, activeClarification);
      }

      let augmentedPrompt = originalInput;
      const contextParts: string[] = [];

      // Add prior context FIRST if this is a follow-up response
      if (priorContextString) {
        contextParts.push(priorContextString);
      }

      contextParts.push(confidenceInstruction);

      if (factsContext) contextParts.push(factsContext);
      if (followUpInstruction) contextParts.push(followUpInstruction);
      if (patientInfo) contextParts.push(patientInfo);
      if (context) contextParts.push(`PROTOCOL CONTEXT:\n${context}`);

      augmentedPrompt = `${contextParts.join('\n\n')}\n\nUSER QUERY:\n${originalInput}`;

      // Create placeholder message for streaming response
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        confidence: confidenceLevel,
      };
      setMessages(prev => [...prev, botMsg]);

      // Fade out quick results when AI starts responding
      setQuickResultsFading(true);
      setTimeout(() => {
        setShowQuickResults(false);
        setQuickResultsFading(false);
      }, 300);
      setStreamingMessageId(botMsgId);

      // Stream response - use direct API in dev mode, Netlify function in production
      let responseText = '';

      try {
        if (isDevMode) {
          // DEV MODE: Use direct Gemini API
          const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string;
          if (!apiKey) {
            throw new Error('VITE_GEMINI_API_KEY not configured for dev mode');
          }

          const ai = new GoogleGenAI({ apiKey });
          const chat = ai.chats.create({
            model: 'gemini-2.0-flash',
            config: {
              systemInstruction: GROUNDED_SYSTEM_PROMPT,
              temperature: 0.1,
            },
          });

          const fullPrompt = context
            ? `PROTOCOL CONTEXT:\n${context}\n\nUSER QUERY:\n${augmentedPrompt}`
            : augmentedPrompt;

          const stream = await chat.sendMessageStream({ message: fullPrompt });

          for await (const chunk of stream) {
            const chunkText = chunk.text || '';
            responseText += chunkText;

            setMessages(prev => prev.map(msg =>
              msg.id === botMsgId
                ? { ...msg, content: responseText }
                : msg
            ));
          }
        } else {
          // PRODUCTION: Use Netlify function
          const authToken = await supabase.auth.getSession().then(res => res.data.session?.access_token);

          abortControllerRef.current = new AbortController();
          const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 30000);

          const response = await fetch('/.netlify/functions/chat-stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            },
            body: JSON.stringify({
              prompt: augmentedPrompt,
              context: context,
              systemPrompt: GROUNDED_SYSTEM_PROMPT,
            }),
            signal: abortControllerRef.current.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('Response body is not readable');
          }

          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    responseText += parsed.text;
                    // RAF-based batching: 60fps-aligned updates for smooth streaming
                    pendingTextRef.current = responseText;
                    if (!updateRafRef.current) {
                      updateRafRef.current = requestAnimationFrame(() => {
                        setMessages(prev => prev.map(msg =>
                          msg.id === botMsgId
                            ? { ...msg, content: pendingTextRef.current }
                            : msg
                        ));
                        updateRafRef.current = null;
                      });
                    }
                  }
                  if (parsed.error) throw new Error(parsed.error);
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', parseError);
                }
              }
            }
          }

          // Final update to ensure all text is rendered
          if (updateRafRef.current) {
            cancelAnimationFrame(updateRafRef.current);
            updateRafRef.current = null;
          }
          setMessages(prev => prev.map(msg =>
            msg.id === botMsgId
              ? { ...msg, content: responseText }
              : msg
          ));
        }
      } catch (streamError: any) {
        console.error('Streaming failed:', streamError);

        if (streamError.name === 'AbortError') {
          responseText = "Request timed out. Please try again.";
        } else if (streamError.message?.includes('401') || streamError.message?.includes('Unauthorized')) {
          responseText = "Authentication error. Please sign in and try again.";
        } else if (streamError.message?.includes('429')) {
          responseText = "Rate limit exceeded. Please wait a moment and try again.";
        } else {
          responseText = `Connection error: ${streamError.message || 'Please try again.'}`;
        }

        setMessages(prev => prev.map(msg =>
          msg.id === botMsgId
            ? { ...msg, content: responseText, isWarning: true }
            : msg
        ));
      } finally {
        setIsStreaming(false);
        setStreamingMessageId(null);
        abortControllerRef.current = null;
      }

      if (!responseText) {
        responseText = "No response generated.";
      }

      // Validate grounding and extract citations
      let citations: CitationLink[] = [];
      let isWarning = false;

      if (retrieval && useRAG) {
        const validation = validateGrounding(responseText, retrieval);
        citations = createCitationLinks(validation.citations);

        // Add citations if response doesn't have them
        responseText = enhanceResponseWithCitations(responseText, retrieval);

        // Flag if grounding is questionable
        if (!validation.isGrounded || validation.ungroundedClaims.length > 0) {
          isWarning = true;
        }
      }

      // Update the streamed message with final content, citations, and warnings
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? {
              ...msg,
              content: responseText,
              citations: citations.length > 0 ? citations : undefined,
              isWarning,
            }
          : msg
      ));

      // Persist assistant message to Supabase with QA/QI metrics
      if (dbSessionId) {
        const responseTimeMs = Date.now() - requestStartTime;
        const protocolsReferenced = citations.map(c => c.ref);
        const declineResponse = isDeclineResponse(responseText);

        const persistData: MessagePersistenceData = {
          sessionId: dbSessionId,
          role: 'assistant',
          content: responseText,
          retrievedChunkIds: retrieval?.chunks?.map(c => c.chunkId),
          confidence: retrieval?.confidence,
          confidenceLevel,
          citations: citations.map(c => ({ ref: c.ref, title: c.title, protocolId: c.protocolId })),
          groundingScore: retrieval?.confidence,
          responseTimeMs,
          protocolsReferenced: protocolsReferenced.length > 0 ? protocolsReferenced : undefined,
          isDeclineResponse: declineResponse,
          hasWarning: isWarning,
        };

        persistMessage(persistData);
      }

      // Detect if assistant asked a clarifying question for next turn
      const newClarification = detectClarifyingQuestion(responseText);
      if (newClarification) {
        // Attach retrieved protocols so we know what was being discussed
        if (retrieval?.protocols) {
          newClarification.retrievedProtocols = Array.from(retrieval.protocols.values()).map(p => ({
            ref: p.ref,
            title: p.title,
          }));
        }
        setPendingClarification(newClarification);
        console.log('[Chat] New clarifying question detected:', {
          question: newClarification.question,
          topic: newClarification.topic,
          type: newClarification.clarificationType,
          protocols: newClarification.retrievedProtocols?.length || 0,
        });
      } else {
        // Clear pending clarification if no question was asked
        setPendingClarification(null);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack?.slice(0, 500),
      });

      let errorMessage = "Connection error. Please try again.";

      // Specific error detection for better debugging
      const errMsg = error?.message?.toLowerCase() || '';
      const errName = error?.name || '';

      if (errMsg.includes('api key') || errMsg.includes('api_key') || errMsg.includes('unauthorized')) {
        errorMessage = "Authentication error. Please check API configuration.";
      } else if (errMsg.includes('quota') || errMsg.includes('rate') || errMsg.includes('429')) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (errMsg.includes('embedding') || errMsg.includes('embed')) {
        errorMessage = "Embedding service error. Retrying with keyword search...";
      } else if (errMsg.includes('supabase') || errMsg.includes('rpc') || errMsg.includes('database')) {
        errorMessage = "Database connection error. Please try again.";
      } else if (errMsg.includes('timeout') || errName === 'AbortError') {
        errorMessage = "Request timed out. The server may be busy. Please try again.";
      } else if (errMsg.includes('network') || errName === 'TypeError' || errMsg.includes('fetch')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (errMsg.includes('model') || errMsg.includes('404') || errMsg.includes('not found')) {
        errorMessage = "AI model unavailable. Please try again later.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        isWarning: true,
      }]);
    } finally {
      setTyping(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-background-dark overflow-hidden">
      <div className="fixed top-12 left-0 right-0 z-40 px-6 pt-4 pb-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <header className="flex justify-between items-center max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/logo.png" alt="Protocol Guide" className="w-10 h-10" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Protocol-Guide</h1>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-slate-100/50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                <button
                  onClick={handleClearChat}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete_sweep</span>
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </header>
      </div>

      <div className="flex-1 overflow-y-auto pt-36 pb-48 px-6 max-w-3xl mx-auto w-full no-scrollbar">
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          <span className="bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
             {protocols.length > 0 ? 'Index Loaded' : 'Database Empty'}
          </span>
          {patientContext && (
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Patient Context Active
            </span>
          )}
        </div>

        {/* Quick Actions - shown when conversation is empty */}
        {messages.length <= 1 && !isTyping && !isStreaming && (
          <QuickActions
            onSelect={(query) => {
              setInput(query);
              // Trigger send after state update
              setTimeout(() => {
                handleSend();
              }, 100);
            }}
            disabled={isTyping || isStreaming}
          />
        )}

        {/* Quick Results - instant local protocol matches while AI processes */}
        <QuickResults
          results={quickResults}
          isVisible={showQuickResults}
          isFading={quickResultsFading}
          onProtocolClick={(ref) => {
            // Navigate to protocol detail
            window.location.href = `/browse?protocol=${ref}`;
          }}
        />

        {messages.map((msg) => (
<<<<<<< HEAD
          <div key={msg.id} className={`flex gap-3 mb-8 ${msg.role === 'user' ? 'flex-row-reverse animate-slide-in-up' : 'animate-fade-in'}`}>
=======
          <div
            key={msg.id}
            id={`msg-${msg.id}`}
            className={`flex gap-3 mb-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''} ${
              msg.role === 'user' ? 'animate-slide-in-up' : ''
            }`}
          >
>>>>>>> 48663ce (chore: Create Chat.tsx)
             {msg.role === 'assistant' && (
                <img src="/logo.png" alt="Protocol Guide" className="w-8 h-8 flex-shrink-0 self-start mt-4 mix-blend-multiply dark:mix-blend-normal" />
             )}

             <div className={`flex flex-col gap-1.5 max-w-[85%] md:max-w-[80%] lg:max-w-[75%] ${msg.role === 'user' ? 'items-end' : ''}`}>
               {msg.role === 'assistant' && (
                 <div className="flex items-center gap-2 ml-1 mb-1">
                   <span className="text-[11px] font-bold text-slate-500">Protocol-Guide</span>
                   {/* Confidence Badge */}
                   {msg.confidence && (
                     <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                       msg.confidence === 'HIGH'
                         ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                         : msg.confidence === 'MEDIUM'
                         ? 'bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300'
                         : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                     }`}>
                       {msg.confidence}
                     </span>
                   )}
                   {/* Warning Indicator */}
                   {msg.isWarning && (
                     <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                       <span className="material-symbols-outlined text-[12px]">warning</span>
                       Verify
                     </span>
                   )}
                 </div>
               )}

               <div className={`p-5 shadow-soft ${
                 msg.role === 'user'
                   ? 'bg-[#9B1B30] text-white rounded-2xl rounded-br-none shadow-[#9B1B30]/20 shadow-lg'
                   : msg.isWarning
                   ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-2xl rounded-bl-none text-slate-800 dark:text-slate-200 shadow-md'
                   : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none text-slate-800 dark:text-slate-200 shadow-md'
               }`}>
                 <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                   {msg.content}
                   {/* Streaming cursor */}
                   {isStreaming && streamingMessageId === msg.id && (
                     <span className="inline-block w-1.5 h-4 bg-primary/60 ml-1 animate-pulse rounded-sm align-middle" />
                   )}
                 </div>

                 {/* Citations Section */}
                 {msg.citations && msg.citations.length > 0 && (
                   <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sources</div>
                     <div className="flex flex-wrap gap-2">
                       {msg.citations.map((citation, idx) => (
                         <a
                           key={idx}
                           href={`/browse?protocol=${citation.protocolId}`}
                           className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#9B1B30]/10 hover:text-[#9B1B30] dark:hover:bg-[#9B1B30]/20 dark:hover:text-[#9B1B30] transition-colors"
                         >
                           <span className="material-symbols-outlined text-[14px]">description</span>
                           {citation.ref}
                         </a>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

               <div className={`flex items-center gap-3 mt-1 ${msg.role === 'user' ? 'mr-1 flex-row-reverse' : 'ml-1'}`}>
                 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                   {msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                   {msg.role === 'user' && <span className="material-symbols-outlined text-[14px] text-blue-400">done_all</span>}
                 </span>
                 {msg.role === 'assistant' && (
                   <FeedbackButtons
                     messageId={msg.id}
                     query={messages.find(m => m.role === 'user' && m.timestamp < msg.timestamp)?.content || ''}
                     response={msg.content}
                   />
                 )}
               </div>
             </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 mb-4">
            <img src="/logo.png" alt="Protocol Guide" className="w-8 h-8 flex-shrink-0 self-start mt-4 mix-blend-multiply dark:mix-blend-normal" />
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-soft">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-[100px] left-0 w-full px-6 z-40">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center p-2 pl-6 transition-all focus-within:ring-2 focus-within:ring-primary/50">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-transparent border-none p-0 py-3 text-[15px] font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                placeholder={isListening ? "Listening..." : "Query protocols (e.g. 'Sepsis fluids')"}
                type="text"
                disabled={isTyping || isStreaming}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isStreaming}
              className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-out active:scale-90 ${
                !input.trim() || isTyping || isStreaming
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-[#B02040] to-[#9B1B30] text-white shadow-lg shadow-[#9B1B30]/25 hover:shadow-xl hover:shadow-[#9B1B30]/40 hover:scale-105 hover:from-[#C02848] hover:to-[#B02040]'
              }`}
            >
              {/* Glow ring on hover */}
              <span className={`absolute inset-0 rounded-full transition-opacity duration-300 ring-4 ring-[#9B1B30]/20 ${
                !input.trim() || isTyping || isStreaming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
              }`} />
              {isStreaming ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className={`material-symbols-outlined text-[24px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}>
                  send
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
