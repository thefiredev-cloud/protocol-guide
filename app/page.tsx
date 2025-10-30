"use client";
import { Hand } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";

import { ChatInputRow } from "@/app/components/chat-input-row";
import { ChatList } from "@/app/components/chat-list";
import { usePageController } from "@/app/hooks/use-page-controller";
import type { ChatMessage } from "@/app/types/chat";

// Lazy load heavy components for better initial load performance
const NarrativePanel = dynamic(
  () => import("@/app/components/narrative-panel").then((m) => ({ default: m.NarrativePanel })),
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
  () => import("@/app/components/quick-actions-bar").then((m) => ({ default: m.QuickActionsBar })),
  {
    ssr: false,
  },
);

const QuickAccessFeatures = dynamic(
  () => import("@/app/components/quick-access-features").then((m) => ({ default: m.QuickAccessFeatures })),
  {
    ssr: false,
  },
);

function initialAssistantMessage(): ChatMessage {
  return {
    role: "assistant",
    content:
      "Welcome. Tell me what you see and what you know.\n\nI use the Los Angeles County Prehospital Care Manual. Reference a protocol, provider impression, or chief complaint so I can map it to the appropriate guidance.",
  };
}

function ChatExperience({ controller }: { controller: ReturnType<typeof usePageController> }) {
  const [oneHandedMode, setOneHandedMode] = useState(false);

  const handleExampleSelect = useCallback(
    (value: string) => {
      controller.chat.setInput(value);
      controller.taRef.current?.focus();
    },
    [controller.chat, controller.taRef],
  );

  const toggleOneHandedMode = useCallback(() => {
    setOneHandedMode((prev) => !prev);
  }, []);

  const handleCallBase = useCallback(() => {
    // Scroll to base contact alert
    const baseContactAlert = document.querySelector('[data-section="base-contact"]');
    if (baseContactAlert) {
      baseContactAlert.scrollIntoView({ behavior: "smooth", block: "center" });
      // Flash the alert to draw attention
      baseContactAlert.classList.add("flash-attention");
      setTimeout(() => baseContactAlert.classList.remove("flash-attention"), 1000);
    }
  }, []);

  const handleProtocolSelect = useCallback(
    (protocol: string) => {
      controller.chat.setInput(protocol);
      controller.taRef.current?.focus();
      controller.send();
    },
    [controller]
  );

  // Apply one-handed mode class to body
  useEffect(() => {
    if (oneHandedMode) {
      document.body.classList.add("one-handed-mode");
    } else {
      document.body.classList.remove("one-handed-mode");
    }
    return () => {
      document.body.classList.remove("one-handed-mode");
    };
  }, [oneHandedMode]);

  return (
    <div className="container">
      <ChatList
        messages={controller.chat.messages}
        onProtocolSelect={controller.sendProtocolSelection}
        onExampleSelect={handleExampleSelect}
        errorBanner={controller.errorBanner}
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

      {/* One-handed mode toggle button */}
      <button
        type="button"
        onClick={toggleOneHandedMode}
        className={`one-handed-toggle ${oneHandedMode ? "active" : ""}`}
        aria-label={oneHandedMode ? "Disable one-handed mode" : "Enable one-handed mode"}
        title={oneHandedMode ? "Disable One-Handed Mode" : "Enable One-Handed Mode"}
      >
        <Hand size={24} strokeWidth={2} />
      </button>

      {/* Quick Actions Bar */}
      <Suspense fallback={null}>
        <QuickActionsBar carePlan={controller.narrative.carePlan} onCallBase={handleCallBase} />
      </Suspense>

      {/* Quick Access Features */}
      <Suspense fallback={null}>
        <QuickAccessFeatures onSelectProtocol={handleProtocolSelect} />
      </Suspense>

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
  const controller = usePageController([initialAssistantMessage()]);
  return <ChatExperience controller={controller} />;
}
