"use client";

import { ChatHeader } from "./components/chat/chat-header";
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
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-text-light dark:text-gray-100 antialiased overflow-hidden flex flex-col">
      {/* Chat Header */}
      <ChatHeader />

      {/* Main Chat Content */}
      <div className="flex-1 overflow-y-auto pt-32 pb-44 px-5 max-w-md mx-auto w-full">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            {/* Welcome Message */}
            <div className="flex justify-center mb-6">
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Ready to assist
              </span>
            </div>

            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-[40px] filled">
                local_hospital
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ProtocolGuide
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Tap the microphone and describe your patient scenario.
              <br />
              I&apos;ll find the relevant LA County protocols for you.
            </p>
          </div>
        ) : (
          <ChatList
            messages={controller.chat.messages}
            onProtocolSelect={controller.sendProtocolSelection}
            errorBanner={controller.errorBanner}
            loading={controller.chat.loading}
            streaming={controller.chat.streaming}
          />
        )}
        <div ref={controller.endRef} />
      </div>

      {/* Quick Lookup Bar */}
      <CriticalLookupBar
        onQuerySubmit={controller.sendProtocolSelection}
        disabled={controller.chat.loading}
      />

      {/* Input Area */}
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
