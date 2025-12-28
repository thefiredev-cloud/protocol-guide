'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { MaterialIcon } from '../components/ui/material-icon';

interface ChatSession {
  id: string;
  title: string | null;
  messageCount: number;
  lastMessageAt: string;
  preview: string | null;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function HistoryItem({
  session,
  onDelete,
}: {
  session: ChatSession;
  onDelete: (id: string) => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <Link
        href={`/?session=${session.id}`}
        className="block p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-all hover:shadow-md active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {session.title || 'Untitled conversation'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {session.preview || 'No messages yet'}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MaterialIcon name="schedule" size={12} />
              <span>{formatRelativeTime(session.lastMessageAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MaterialIcon name="chat_bubble" size={12} />
              <span>{session.messageCount}</span>
            </div>
          </div>
        </div>
      </Link>
      {showDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          aria-label="Delete conversation"
        >
          <MaterialIcon name="delete" size={16} />
        </button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <MaterialIcon
          name="chat_bubble"
          size={32}
          className="text-gray-400 dark:text-gray-500"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No conversations yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        Start a new conversation with the AI assistant to see your chat history
        here.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
      >
        <MaterialIcon name="chat_bubble" size={18} />
        Start a conversation
      </Link>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/history?limit=50');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = useCallback(async (sessionId: string) => {
    if (!confirm('Delete this conversation?')) return;

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

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.title?.toLowerCase().includes(query) ||
      session.preview?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              History
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {sessions.length > 0 && (
          <div className="px-5 pb-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MaterialIcon
                  name="search"
                  size={20}
                  className="text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium placeholder:text-gray-400/70 dark:placeholder:text-gray-500/70 text-gray-900 dark:text-white transition-all shadow-sm"
              />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-5 max-w-2xl mx-auto w-full pt-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              type="button"
              onClick={fetchSessions}
              className="mt-4 text-primary font-medium"
            >
              Try again
            </button>
          </div>
        ) : filteredSessions.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No conversations match &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <HistoryItem
                key={session.id}
                session={session}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
