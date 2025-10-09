"use client";

export function EmptyNarrativeState({ onBuild }: { onBuild?: () => void }) {
  return (
    <div
      className="narrative-panel"
      style={{ marginTop: "16px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "12px" }}
    >
      <span>
        Provide patient details (chief complaint, vitals, interventions) and try Build Narrative again to auto-fill
        documentation.
      </span>
      <button type="button" onClick={onBuild} style={{ padding: "6px 12px" }}>
        Build Narrative
      </button>
    </div>
  );
}


