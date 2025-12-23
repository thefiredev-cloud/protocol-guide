import { memo } from "react";

import { HealthStatusBanner } from "@/app/components/chat/health-status-banner";
import { MessageItem } from "@/app/components/chat/sob-protocols";
import type { ChatMessage } from "@/app/types/chat";

type ChatListProps = {
  messages: ChatMessage[];
  onProtocolSelect: (key: string) => void;
  onExampleSelect?: (value: string) => void;
  loading?: boolean;
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

// Thinking animation component
const ThinkingIndicator = memo(function ThinkingIndicator() {
  return (
    <div className="msg assistant thinking-indicator" role="status" aria-label="AI is thinking">
      <div className="thinking-content">
        <div className="thinking-dots">
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
        </div>
        <span className="thinking-text">Medic-Bot is analyzing...</span>
      </div>
    </div>
  );
});

// Memoize entire chat list
export const ChatList = memo(function ChatList({
  messages,
  onProtocolSelect,
  errorBanner,
  loading = false
}: Omit<ChatListProps, 'onExampleSelect'> & { errorBanner?: string | null; loading?: boolean }) {
  // REMOVED: WelcomeCard is redundant - WelcomeHero in page.tsx handles initial welcome
  // const onlyIntroMessage = messages.length === 1 && messages[0]?.role === "assistant";

  return (
    <div>
      <HealthStatusBanner hidden={Boolean(errorBanner)} />
      {errorBanner ? (
        <div className="errorBanner" role="status">
          {errorBanner}
        </div>
      ) : null}
      <div className="chat">
        {messages.map((message, index) => (
          <MemoizedMessageWrapper
            key={`${message.role}-${index}`}
            message={message}
            onProtocolSelect={onProtocolSelect}
          />
        ))}
        {loading && <ThinkingIndicator />}
      </div>
    </div>
  );
});
