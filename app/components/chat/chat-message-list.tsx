import { memo } from "react";

import type { ChatMessage } from "../../types/chat";
import { MaterialIcon } from "../ui/material-icon";
import { HealthStatusBanner } from "./health-status-banner";
import { MessageItem } from "./sob-protocols";

type ChatListProps = {
  messages: ChatMessage[];
  onProtocolSelect: (key: string) => void;
  onExampleSelect?: (value: string) => void;
  loading?: boolean;
  streaming?: boolean;
};

// Thinking animation component (shown before streaming starts)
const ThinkingIndicator = memo(function ThinkingIndicator() {
  return (
    <div className="flex gap-3 mb-4" role="status" aria-label="AI is thinking">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center self-end mb-1">
        <MaterialIcon name="smart_toy" filled size={16} className="text-primary" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-soft">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
});

// Streaming cursor component (shown at end of streaming message)
const StreamingCursor = memo(function StreamingCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5"
      aria-hidden="true"
    />
  );
});

// Message wrapper component with proper styling
const MessageWrapper = memo(function MessageWrapper({
  message,
  onProtocolSelect,
  isStreaming = false,
}: {
  message: ChatMessage;
  onProtocolSelect: (key: string) => void;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    // User message - right aligned, primary background
    return (
      <div className="flex gap-3 mb-6 flex-row-reverse">
        <div className="flex flex-col gap-1 max-w-[85%] items-end">
          <div className="bg-primary text-white rounded-2xl rounded-br-none p-4 shadow-md shadow-red-500/20">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <span className="text-[10px] text-gray-400 mr-1 flex items-center gap-1">
            <MaterialIcon name="done_all" size={12} />
          </span>
        </div>
      </div>
    );
  }

  // Assistant message - left aligned with avatar
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center self-end mb-1">
        <MaterialIcon name="smart_toy" filled size={16} className="text-primary" />
      </div>
      <div className="flex flex-col gap-1 max-w-[90%]">
        <span className="text-[10px] text-gray-400 ml-1">Protocol Assistant</span>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-soft">
          <MessageItem m={message} onProtocolSelect={onProtocolSelect} />
          {isStreaming && <StreamingCursor />}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.isStreaming === nextProps.isStreaming
  );
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

      {errorBanner && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-800 dark:text-red-200"
          role="status"
        >
          {errorBanner}
        </div>
      )}

      {/* Date separator */}
      {messages.length > 0 && (
        <div className="flex justify-center mb-6">
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Today
          </span>
        </div>
      )}

      {/* Messages */}
      <div>
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isStreamingMessage = streaming && isLastMessage && message.role === "assistant";

          return (
            <MessageWrapper
              key={`${message.role}-${index}`}
              message={message}
              onProtocolSelect={onProtocolSelect}
              isStreaming={isStreamingMessage}
            />
          );
        })}

        {loading && !streaming && <ThinkingIndicator />}
      </div>
    </div>
  );
});
