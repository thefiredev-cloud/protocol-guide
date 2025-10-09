"use client";

import type { NemsisNarrative } from "@/app/types/chat";

export function NemsisSection({ nemsis }: { nemsis: NemsisNarrative }) {
  const hasContent = Boolean(nemsis.eSituation?.primaryComplaint || nemsis.eVitals?.length);
  if (!hasContent) return null;
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3>NEMSIS (summary)</h3>
      <div style={{ fontSize: "14px", color: "var(--muted)" }}>
        eSituation.primaryComplaint: {nemsis.eSituation?.primaryComplaint || "—"}
      </div>
    </div>
  );
}


