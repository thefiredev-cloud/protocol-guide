'use client';

/**
 * Chat History Hook
 * Manages fetching and deleting chat sessions
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Chat session summary from API
 */
export type ChatSessionSummary = {
  id: string;
  title: string | null;
  messageCount: number;
  lastMessageAt: string;
  preview: string | null;
};

/**
 * Chat history hook return type
 */
interface UseChatHistoryReturn {
  sessions: ChatSessionSummary[];
  loading: boolean;
  error: string | null;
  refresh: (limit?: number, offset?: number) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

/**
 * Hook for managing chat history
 */
export function useChatHistory(): UseChatHistoryReturn {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch chat history from API
   */
  const refresh = useCallback(async (limit = 20, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/chat/history?limit=${limit}&offset=${offset}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      setSessions(data.sessions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a chat session
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    sessions,
    loading,
    error,
    refresh,
    deleteSession,
  };
}
