"use client";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";

import { ChatInputRow } from "@/app/components/chat/chat-input-row";
import { ChatList } from "@/app/components/chat/chat-list";
import { WelcomeHero } from "@/app/components/welcome/welcome-hero";
import { usePageController } from "@/app/hooks/use-page-controller";

// Lazy load heavy components for better initial load performance
const NarrativePanel = dynamic(
  () => import("@/app/components/narrative/narrative-panel").then((m) => ({ default: m.NarrativePanel })),
  {
    loading: () => (
      <div className="skeleton skeleton-narrative">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    ),
    ssr: false,
  },
);

const QuickActionsBar = dynamic(
  () => import("@/app/components/chat/quick-actions-bar").then((m) => ({ default: m.QuickActionsBar })),
  {
    ssr: false,
  },
);

const QuickAccessFeatures = dynamic(
  () => import("@/app/components/chat/quick-access-features").then((m) => ({ default: m.QuickAccessFeatures })),
  {
    ssr: false,
  },
);

// REMOVED: Initial assistant message no longer needed - WelcomeHero provides welcome experience
// function initialAssistantMessage(): ChatMessage {
//   return {
//     role: "assistant",
//     content:
//       "Welcome. Tell me what you see and what you know.\n\nI use the Los Angeles County Prehospital Care Manual. Reference a protocol, provider impression, or chief complaint so I can map it to the appropriate guidance.",
//   };
// }

function ChatExperience({ controller }: { controller: ReturnType<typeof usePageController> }) {
  const [forceChatView, setForceChatView] = useState(false);

  const handleExampleSelect = useCallback(
    (value: string) => {
      controller.chat.setInput(value);
      controller.taRef.current?.focus();
    },
    [controller.chat, controller.taRef],
  );

  const handleProtocolSelect = useCallback(
    (protocol: string) => {
      controller.chat.setInput(protocol);
      controller.taRef.current?.focus();
      controller.send();
    },
    [controller]
  );

  const handleWelcomeSearch = useCallback(
    (query: string) => {
      // Immediately transition to chat view and start processing
      setForceChatView(true);
      controller.chat.setInput(query);
      controller.taRef.current?.focus();
      controller.send();
    },
    [controller]
  );

  // Show welcome hero when no user interaction has occurred yet
  const showWelcome = !forceChatView && controller.chat.messages.length === 0;

  return (
    <div className="container">
      {showWelcome ? (
        <WelcomeHero
          onProtocolSelect={handleProtocolSelect}
          onExampleSelect={handleExampleSelect}
          onSearch={handleWelcomeSearch}
        />
      ) : (
        <>
          <ChatList
            messages={controller.chat.messages}
            onProtocolSelect={controller.sendProtocolSelection}
            errorBanner={controller.errorBanner}
            loading={controller.chat.loading}
          />
          <Suspense
        fallback={
          <div className="skeleton skeleton-narrative">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        }
      >
        <NarrativePanel
          soap={controller.narrative.soap}
          chronological={controller.narrative.chronological}
          nemsis={controller.narrative.nemsis}
          carePlan={controller.narrative.carePlan}
          citations={controller.narrative.citations}
          recentOrders={controller.narrative.recentOrders}
          onBuildNarrative={controller.buildNarrative}
        />
          </Suspense>
          <div ref={controller.endRef} />

          {/* One-handed mode toggle button - HIDDEN: Reduced visual clutter */}
          {/* <button
            type="button"
            onClick={toggleOneHandedMode}
            className={`one-handed-toggle ${oneHandedMode ? "active" : ""}`}
            aria-label={oneHandedMode ? "Disable one-handed mode" : "Enable one-handed mode"}
            title={oneHandedMode ? "Disable One-Handed Mode" : "Enable One-Handed Mode"}
          >
            <Hand size={24} strokeWidth={2} />
          </button> */}

          {/* Quick Actions Bar - HIDDEN: Reduced visual clutter */}
          {/* <Suspense fallback={null}>
            <QuickActionsBar carePlan={controller.narrative.carePlan} onCallBase={handleCallBase} />
          </Suspense> */}

          {/* Quick Access Features - HIDDEN: Reduced visual clutter */}
          {/* <Suspense fallback={null}>
            <QuickAccessFeatures onSelectProtocol={handleProtocolSelect} />
          </Suspense> */}
        </>
      )}

      <ChatInputRow
        input={controller.chat.input}
        loading={controller.chat.loading}
        onInput={controller.chat.setInput}
        onSend={controller.send}
        taRef={controller.taRef}
        onKeyDown={controller.onKeyDown}
        onToggleVoice={controller.onToggleVoice}
        voiceSupported={controller.voice.voiceSupported}
        listening={controller.voice.listening}
        onBuildNarrative={controller.buildNarrative}
      />
    </div>
  );
}

export default function Page() {
  // Start with empty messages array - WelcomeHero handles initial welcome experience
  const controller = usePageController([]);
  return <ChatExperience controller={controller} />;
}
