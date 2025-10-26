"use client";

import type { NarrativeDraft } from "@/app/types/chat";

import { SectionCard } from "./section-card";

function draftHasLines(draft?: NarrativeDraft): boolean {
  if (!draft) return false;
  return draft.sections.some((section) => (section.lines || []).some((line) => line.trim().length > 0));
}

export function NarrativeSections({ draft, label }: { draft: NarrativeDraft; label: string }) {
  if (!draftHasLines(draft)) return null;
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3>{label}</h3>
      {draft.sections
        .map((section) => {
          const lines = (section.lines || []).filter((line) => line.trim().length > 0);
          return lines.length ? <SectionCard key={section.title} title={section.title} items={lines} /> : null;
        })
        .filter(Boolean)}
    </div>
  );
}


