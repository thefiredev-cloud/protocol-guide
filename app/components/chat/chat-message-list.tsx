import { memo } from "react";

import { HealthStatusBanner } from "./health-status-banner";
import { MessageItem } from "./sob-protocols";
import type { ChatMessage } from "../../types/chat";

type ChatListProps = {
  messages: ChatMessage[];
  onProtocolSelect: (key: string) => void;
  onExampleSelect?: (value: string) => void;
  loading?: boolean;
  streaming?: boolean;
};

// Memoize individual message wrapper to prevent unnecessary re-renders
const MemoizedMessageWrapper = memo(function MessageWrapper({
  message,
  onProtocolSelect
}: {
  message: ChatMessage;
  onProtocolSelect: (key: string) => void;
}) {
  return (
    <div className={`msg ${message.role} scroll-animate-fade`}>
      <MessageItem m={message} onProtocolSelect={onProtocolSelect} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison for better performance
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role
  );
});

// Thinking animation component (shown before streaming starts)
const ThinkingIndicator = memo(function ThinkingIndicator() {
  return (
    <div className="msg assistant thinking-indicator" role="status" aria-label="AI is thinking">
      <div className="thinking-content">
        <div className="thinking-dots">
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
        </div>
        <span className="thinking-text">Analyzing...</span>
      </div>
    </div>
  );
});

// Streaming cursor component (shown at end of streaming message)
const StreamingCursor = memo(function StreamingCursor() {
  return <span className="streaming-cursor" aria-hidden="true" />;
});

// Memoize entire chat list
export const ChatList = memo(function ChatList({
  messages,
  onProtocolSelect,
  errorBanner,
  loading = false,
  streaming = false
}: Omit<ChatListProps, 'onExampleSelect'> & { errorBanner?: string | null; loading?: boolean; streaming?: boolean }) {
  return (
    <div>
      <HealthStatusBanner hidden={Boolean(errorBanner)} />
      {errorBanner ? (
        <div className="errorBanner" role="status">
          {errorBanner}
        </div>
      ) : null}
      <div className="chat">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isStreamingMessage = streaming && isLastMessage && message.role === "assistant";
          return (
            <div key={`${message.role}-${index}`} className={`msg ${message.role} scroll-animate-fade ${isStreamingMessage ? 'streaming' : ''}`}>
              <MessageItem m={message} onProtocolSelect={onProtocolSelect} />
              {isStreamingMessage && <StreamingCursor />}
            </div>
          );
        })}
        {loading && !streaming && <ThinkingIndicator />}
      </div>
    </div>
  );
});
