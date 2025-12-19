"use client";

import { Suspense } from "react";

import { ChatList } from "@/app/components/chat/chat-list";
import { VoiceFirstInput } from "@/app/components/chat/voice-first-input";
import { NarrativeExportPanel } from "@/app/components/narrative/narrative-export-panel";
import { usePageController } from "@/app/hooks/use-page-controller";

/**
 * Simplified chatbot page
 * Voice-first input, chat messages, narrative export
 */
export default function Page() {
  const controller = usePageController([]);

  const hasMessages = controller.chat.messages.length > 0;
  const hasNarrative = controller.narrative.soap || controller.narrative.nemsis;

  return (
    <div className="chatbot-container">
      <div className="chatbot-content">
        {!hasMessages ? (
          <div className="empty-state">
            <div className="empty-state-title">LA County Protocol Assistant</div>
            <p className="empty-state-text">
              Tap the microphone and describe your patient scenario.
              <br />
              I&apos;ll recommend protocols and help build your narrative.
            </p>
          </div>
        ) : (
          <>
            <ChatList
              messages={controller.chat.messages}
              onProtocolSelect={controller.sendProtocolSelection}
              errorBanner={controller.errorBanner}
              loading={controller.chat.loading}
            />

            {hasNarrative && (
              <Suspense fallback={<div className="skeleton" />}>
                <NarrativeExportPanel
                  soap={controller.narrative.soap}
                  nemsis={controller.narrative.nemsis}
                  carePlan={controller.narrative.carePlan}
                  onBuildNarrative={controller.buildNarrative}
                />
              </Suspense>
            )}
          </>
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
      />
    </div>
  );
}
