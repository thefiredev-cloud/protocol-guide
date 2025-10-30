"use client";

export function EmptyNarrativeState({ onBuild }: { onBuild?: () => void }) {
  const isDisabled = !onBuild;
  
  return (
    <div className="narrative-panel empty-state">
      <span>
        Provide patient details (chief complaint, vitals, interventions) and try Build Narrative again to auto-fill
        documentation.
      </span>
    </div>
  );
}
