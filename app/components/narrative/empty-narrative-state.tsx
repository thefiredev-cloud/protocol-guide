"use client";

export function EmptyNarrativeState({ onBuild }: { onBuild?: () => void }) {
  const isDisabled = !onBuild;
  
  return (
    <div className="narrative-panel empty-state">
      <span>
        Provide patient details (chief complaint, vitals, interventions) and try Build Narrative again to auto-fill
        documentation.
      </span>
      <button
        type="button"
        onClick={onBuild ? () => onBuild() : undefined}
        disabled={isDisabled}
        className="build-narrative-button"
        aria-label={isDisabled ? "Build Narrative (requires patient data)" : "Build Narrative"}
        aria-disabled={isDisabled}
        title={isDisabled ? "Please provide patient details first" : "Generate narrative from patient data"}
      >
        Build Narrative
      </button>
    </div>
  );
}
