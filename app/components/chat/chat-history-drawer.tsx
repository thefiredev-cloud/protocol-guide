'use client';

/**
 * Chat History Drawer Component
 * Displays list of previous chat sessions
 */

import {
  useChatHistory,
  type ChatSessionSummary,
} from "../../hooks/use-chat-history";

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

/**
 * Format relative date for display
 */
function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

/**
 * Chat history drawer component
 */
export function ChatHistoryDrawer({
  isOpen,
  onClose,
  onSelectSession,
  onNewChat,
}: ChatHistoryDrawerProps) {
  const { sessions, loading, deleteSession } = useChatHistory();

  if (!isOpen) return null;

  return (
    <div className="chat-history-overlay" onClick={onClose}>
      <div
        className="chat-history-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chat-history-header">
          <h2>Chat History</h2>
          <div className="chat-history-actions">
            <button onClick={onNewChat} className="new-chat-btn">
              + New Chat
            </button>
            <button
              onClick={onClose}
              className="close-btn"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="chat-history-list">
          {loading ? (
            <div className="chat-history-loading">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="chat-history-empty">No previous conversations</div>
          ) : (
            sessions.map((session) => (
              <ChatHistoryItem
                key={session.id}
                session={session}
                onSelect={() => onSelectSession(session.id)}
                onDelete={() => deleteSession(session.id)}
              />
            ))
          )}
        </div>

        <style jsx>{`
          .chat-history-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 100;
          }

          .chat-history-drawer {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 320px;
            max-width: 100%;
            background: white;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            z-index: 101;
          }

          .chat-history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .chat-history-header h2 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
          }

          .chat-history-actions {
            display: flex;
            gap: 0.5rem;
          }

          .new-chat-btn {
            background: #c41e3a;
            color: white;
            border: none;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            cursor: pointer;
          }

          .new-chat-btn:hover {
            background: #a31830;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            color: #6b7280;
          }

          .close-btn:hover {
            color: #374151;
          }

          .chat-history-list {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem;
          }

          .chat-history-loading,
          .chat-history-empty {
            padding: 2rem;
            text-align: center;
            color: #6b7280;
          }
        `}</style>
      </div>
    </div>
  );
}

/**
 * Individual chat history item
 */
function ChatHistoryItem({
  session,
  onSelect,
  onDelete,
}: {
  session: ChatSessionSummary;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="chat-history-item" onClick={onSelect}>
      <div className="session-title">
        {session.title ?? session.preview ?? 'Untitled conversation'}
      </div>
      <div className="session-meta">
        {session.messageCount} messages &bull;{' '}
        {formatRelativeDate(session.lastMessageAt)}
      </div>
      <button
        className="delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete conversation"
      >
        Delete
      </button>

      <style jsx>{`
        .chat-history-item {
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 0.5rem;
          position: relative;
        }

        .chat-history-item:hover {
          background: #f3f4f6;
        }

        .session-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 3rem;
        }

        .session-meta {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .delete-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #dc2626;
          font-size: 0.75rem;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .chat-history-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
