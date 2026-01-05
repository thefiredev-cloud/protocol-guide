
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat as GeminiChat } from "@google/genai";
import { protocols } from '../data/protocols';
import { Protocol } from '../types';
import { useWidgetMode, PatientContext } from '../contexts/WidgetModeContext';

interface Source {
  uri: string;
  title: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<GeminiChat | null>(null);
  const { patientContext, isWidgetMode } = useWidgetMode();

  // Format patient context for AI prompt
  const formatPatientContext = (ctx: PatientContext | null): string => {
    if (!ctx) return '';
    const parts: string[] = [];
    if (ctx.age !== undefined) {
      parts.push(`Age: ${ctx.age} ${ctx.ageUnit || 'years'}`);
    }
    if (ctx.weight !== undefined) {
      parts.push(`Weight: ${ctx.weight} kg`);
    }
    if (ctx.sex) {
      parts.push(`Sex: ${ctx.sex}`);
    }
    if (ctx.chiefComplaint) {
      parts.push(`Chief Complaint: ${ctx.chiefComplaint}`);
    }
    if (ctx.incidentType) {
      parts.push(`Incident: ${ctx.incidentType}`);
    }
    return parts.length > 0 ? `PATIENT INFO: ${parts.join(' | ')}` : '';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      setMessages([{
        id: 'init-error',
        role: 'assistant',
        content: 'AI service not configured. Protocol browsing is still available.',
        timestamp: new Date()
      }]);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Lightweight System Instruction
      const systemInstruction = `ROLE: Protocol-Guide (LA County EMS Assistant).

      INSTRUCTIONS:
      1. You are an expert paramedic assistant for LA County Fire Dept.
      2. You will receive relevant protocol extracts with each user message under "CONTEXT".
      3. ANSWER ONLY using the provided context or previous conversation history.
      4. If the context is empty and the question is not about general medical knowledge contained in previous turns, politely ask for clarification.
      5. BE EXTREMELY CONCISE. Bullet points are preferred.
      6. FORMATTING: Do NOT use markdown bold (**). Use plain text.
      7. Always cite the Protocol Ref Number (e.g. "Ref: 1210") if available.
      `;

      chatSession.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
          temperature: 0.1,
        },
      });

      setMessages([{
        id: 'init-1',
        role: 'assistant',
        content: `Protocol-Guide Active. Ready for rapid retrieval.`,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Failed to initialize AI:', err);
      setMessages([{
        id: 'init-error',
        role: 'assistant',
        content: 'Failed to initialize AI service. Please refresh and try again.',
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;
    
    const originalInput = input; // Keep original for UI

    // 1. Retrieve Context
    const context = getRelevantContext(originalInput);

    // 2. Get patient context from ImageTrend (if in widget mode)
    const patientInfo = formatPatientContext(patientContext);

    // 3. Construct Augmented Prompt with patient context
    let augmentedPrompt = originalInput;
    if (patientInfo || context) {
      const contextParts: string[] = [];
      if (patientInfo) contextParts.push(patientInfo);
      if (context) contextParts.push(`PROTOCOL CONTEXT:\n${context}`);
      augmentedPrompt = `${contextParts.join('\n\n')}\n\nUSER QUERY:\n${originalInput}`;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: originalInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 3. Send Augmented Prompt (Hidden from user UI, but seen by AI)
      const result = await chatSession.current.sendMessage({ message: augmentedPrompt });
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: result.text || "No response generated.", timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);

      let errorMessage = "Connection error. Please try again.";

      if (error?.message?.includes('API key')) {
        errorMessage = "Authentication error. Please check API configuration.";
      } else if (error?.message?.includes('quota') || error?.message?.includes('rate')) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error?.message?.includes('network') || error?.name === 'TypeError') {
        errorMessage = "Network error. Please check your connection.";
      } else if (error?.message?.includes('model')) {
        errorMessage = "AI model unavailable. Please try again later.";
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMessage, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-background-dark overflow-hidden">
      <div className="fixed top-12 left-0 right-0 z-40 px-6 pt-4 pb-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <header className="flex justify-between items-center max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#9B1B30]/20 dark:bg-[#9B1B30]/30 flex items-center justify-center text-primary border border-[#9B1B30]/30 dark:border-[#9B1B30]/50 overflow-hidden">
                <img src="/logo.png" alt="Protocol Guide" className="w-9 h-9" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Protocol-Guide</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gemini 3 Flash</p>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-100/50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
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

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 mb-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
             {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#9B1B30]/10 dark:bg-[#9B1B30]/20 flex items-center justify-center self-start mt-4 border border-[#9B1B30]/20 dark:border-[#9B1B30]/30 overflow-hidden">
                  <img src="/logo.png" alt="Protocol Guide" className="w-6 h-6" />
                </div>
             )}

             <div className={`flex flex-col gap-1.5 max-w-[82%] ${msg.role === 'user' ? 'items-end' : ''}`}>
               {msg.role === 'assistant' && <span className="text-[11px] font-bold text-slate-400 ml-1 mb-1">Protocol-Guide</span>}
               
               <div className={`p-5 shadow-soft ${
                 msg.role === 'user' 
                   ? 'bg-[#9B1B30] text-white rounded-2xl rounded-br-none shadow-[#9B1B30]/20 shadow-lg' 
                   : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none text-slate-800 dark:text-slate-200 shadow-md'
               }`}>
                 <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                   {msg.content}
                 </div>
               </div>
               
               <span className={`text-[10px] font-bold text-slate-400 mt-1 ${msg.role === 'user' ? 'mr-1 flex items-center gap-1' : 'ml-1'}`}>
                 {msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} 
                 {msg.role === 'user' && <span className="material-symbols-outlined text-[14px] text-blue-400">done_all</span>}
               </span>
             </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#9B1B30]/10 dark:bg-[#9B1B30]/20 flex items-center justify-center self-start mt-4">
              <span className="material-symbols-outlined text-primary text-[18px] filled">smart_toy</span>
            </div>
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
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center p-2 pl-6 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-transparent border-none p-0 py-3 text-[15px] font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none" 
                placeholder="Query protocols (e.g. 'Sepsis fluids')" 
                type="text" 
                disabled={isTyping}
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 ${
                !input.trim() || isTyping ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : 'bg-slate-900 dark:bg-[#9B1B30] text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] ml-1">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
