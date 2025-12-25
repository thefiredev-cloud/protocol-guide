"use client";

import { ChatList } from "./components/chat/chat-message-list";
import { CriticalLookupBar } from "./components/chat/critical-lookup-bar";
import { VoiceFirstInput } from "./components/chat/voice-input-control";
import { usePageController } from "./hooks/use-page-controller";

/**
 * ProtocolGuide - LA County Protocol Assistant
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
            <div className="empty-state-title">ProtocolGuide</div>
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

      <CriticalLookupBar
        onQuerySubmit={controller.sendProtocolSelection}
        disabled={controller.chat.loading}
      />

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
