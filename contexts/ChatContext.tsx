import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { GoogleGenAI, Chat as GeminiChat } from "@google/genai";
import type { ConversationFacts, PendingClarification } from '../lib/conversation';

const CHAT_STORAGE_KEY = 'protocolguide_chat';
const SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 hours

// Message interface (moved from Chat.tsx for shared use)
export interface CitationLink {
  ref: string;
  title: string;
  protocolId: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: CitationLink[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  isWarning?: boolean;
}

interface StoredChatSession {
  sessionId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string; // ISO string for storage
    citations?: CitationLink[];
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    isWarning?: boolean;
  }>;
  conversationFacts: ConversationFacts;
  pendingClarification?: PendingClarification | null;
  expiresAt: number;
}

export interface ChatContextType {
  // State
  sessionId: string | null;
  messages: Message[];
  conversationFacts: ConversationFacts;
  pendingClarification: PendingClarification | null;
  isTyping: boolean;
  chatSession: GeminiChat | null;
  useRAG: boolean;

  // Actions
  addMessage: (message: Message) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  updateFacts: (facts: ConversationFacts) => void;
  setPendingClarification: (clarification: PendingClarification | null) => void;
  setTyping: (isTyping: boolean) => void;
  startNewSession: () => void;
  clearSession: () => void;
  initializeChatSession: (session: GeminiChat) => void;
  setUseRAG: (value: boolean) => void;
}

// Validate stored session structure
const isValidStoredSession = (data: unknown): data is StoredChatSession => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.sessionId === 'string' &&
    typeof obj.expiresAt === 'number' &&
    Array.isArray(obj.messages) &&
    typeof obj.conversationFacts === 'object'
  );
};

// Safe localStorage operations
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
};

// Generate unique session ID
const generateSessionId = (): string => {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Convert Message to storable format
const serializeMessages = (messages: Message[]): StoredChatSession['messages'] => {
  return messages.map(m => ({
    ...m,
    timestamp: m.timestamp.toISOString(),
  }));
};

// Convert stored format back to Message
const deserializeMessages = (stored: StoredChatSession['messages']): Message[] => {
  return stored.map(m => ({
    ...m,
    timestamp: new Date(m.timestamp),
  }));
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationFacts, setConversationFacts] = useState<ConversationFacts>({});
  const [pendingClarification, setPendingClarificationState] = useState<PendingClarification | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [useRAG, setUseRAG] = useState(false);
  const chatSessionRef = useRef<GeminiChat | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = safeGetItem(CHAT_STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (isValidStoredSession(parsed)) {
          // Check if session is expired
          if (Date.now() < parsed.expiresAt) {
            setSessionId(parsed.sessionId);
            setMessages(deserializeMessages(parsed.messages));
            setConversationFacts(parsed.conversationFacts || {});
            setPendingClarificationState(parsed.pendingClarification || null);
          } else {
            // Session expired, clear it
            safeRemoveItem(CHAT_STORAGE_KEY);
            // Start fresh session
            setSessionId(generateSessionId());
          }
        } else {
          // Invalid data structure, clear it
          safeRemoveItem(CHAT_STORAGE_KEY);
          setSessionId(generateSessionId());
        }
      } catch {
        // Invalid JSON, clear it
        safeRemoveItem(CHAT_STORAGE_KEY);
        setSessionId(generateSessionId());
      }
    } else {
      // No stored session, create new one
      setSessionId(generateSessionId());
    }
  }, []);

  // Persist session to localStorage whenever state changes
  useEffect(() => {
    if (!sessionId) return;

    // Don't persist empty sessions (only init message)
    if (messages.length <= 1) return;

    const sessionData: StoredChatSession = {
      sessionId,
      messages: serializeMessages(messages),
      conversationFacts,
      pendingClarification,
      expiresAt: Date.now() + SESSION_EXPIRY_MS,
    };

    safeSetItem(CHAT_STORAGE_KEY, JSON.stringify(sessionData));
  }, [sessionId, messages, conversationFacts, pendingClarification]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateFacts = useCallback((facts: ConversationFacts) => {
    setConversationFacts(facts);
  }, []);

  const setPendingClarification = useCallback((clarification: PendingClarification | null) => {
    setPendingClarificationState(clarification);
  }, []);

  const setTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  const initializeChatSession = useCallback((session: GeminiChat) => {
    chatSessionRef.current = session;
  }, []);

  const startNewSession = useCallback(() => {
    // Clear current session
    safeRemoveItem(CHAT_STORAGE_KEY);

    // Reset state
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMessages([]);
    setConversationFacts({});
    setIsTyping(false);
    chatSessionRef.current = null;
  }, []);

  const clearSession = useCallback(() => {
    safeRemoveItem(CHAT_STORAGE_KEY);
    setSessionId(null);
    setMessages([]);
    setConversationFacts({});
    setIsTyping(false);
    chatSessionRef.current = null;
  }, []);

  return (
    <ChatContext.Provider
      value={{
        sessionId,
        messages,
        conversationFacts,
        isTyping,
        chatSession: chatSessionRef.current,
        useRAG,
        addMessage,
        setMessages,
        updateFacts,
        setTyping,
        startNewSession,
        clearSession,
        initializeChatSession,
        setUseRAG,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
