"use client";

import { ChatList } from "@/app/components/chat/chat-list";
import { VoiceFirstInput } from "@/app/components/chat/voice-first-input";
import { usePageController } from "@/app/hooks/use-page-controller";

/**
 * LA County Protocol Assistant
 * Voice-first protocol retrieval for paramedics
 */
export default function Page() {
  const controller = usePageController([]);

  const hasMessages = controller.chat.messages.length > 0;

  return (
    <div className="chatbot-container">
      <div className="chatbot-content">
        {!hasMessages ? (
          <div className="empty-state">
            <div className="empty-state-title">LA County Protocol Assistant</div>
            <p className="empty-state-text">
              Tap the microphone and describe your patient scenario.
              <br />
              I&apos;ll find the relevant protocols for you.
            </p>
          </div>
        ) : (
          <ChatList
            messages={controller.chat.messages}
            onProtocolSelect={controller.sendProtocolSelection}
            errorBanner={controller.errorBanner}
            loading={controller.chat.loading}
          />
        )}
        <div ref={controller.endRef} />
      </div>

      <VoiceFirstInput
        input={controller.chat.input}
        loading={controller.chat.loading}
        onInput={controller.chat.setInput}
        onSend={controller.send}
        taRef={controller.taRef}
        onKeyDown={controller.onKeyDown}
        onToggleVoice={controller.onToggleVoice}
        voiceSupported={controller.voice.voiceSupported}
        listening={controller.voice.listening}
        voiceState={controller.voice.state}
      />
    </div>
  );
}
