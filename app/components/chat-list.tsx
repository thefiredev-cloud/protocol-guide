import { memo } from "react";

import { HealthStatusBanner } from "@/app/components/health-status-banner";
import { MessageItem } from "@/app/components/sob-protocols";
import { WelcomeCard } from "@/app/components/welcome-card";
import type { ChatMessage } from "@/app/types/chat";

type ChatListProps = {
  messages: ChatMessage[];
  onProtocolSelect: (key: string) => void;
  onExampleSelect?: (value: string) => void;
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
    <div className={`msg ${message.role}`}>
      <MessageItem m={message} onProtocolSelect={onProtocolSelect} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if message content or role changed
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role
  );
});

// Memoize entire chat list
export const ChatList = memo(function ChatList({
  messages,
  onProtocolSelect,
  onExampleSelect,
  errorBanner
}: ChatListProps & { errorBanner?: string | null }) {
  const onlyIntroMessage = messages.length === 1 && messages[0]?.role === "assistant";

  return (
    <div>
      <HealthStatusBanner hidden={Boolean(errorBanner)} />
      {errorBanner ? (
        <div className="errorBanner" role="status">
          {errorBanner}
        </div>
      ) : null}
      {onlyIntroMessage ? <WelcomeCard onExampleSelect={onExampleSelect} /> : null}
      <div className="chat">
        {messages.map((message, index) => (
          <MemoizedMessageWrapper
            key={`${message.role}-${index}`}
            message={message}
            onProtocolSelect={onProtocolSelect}
          />
        ))}
      </div>
    </div>
  );
});
