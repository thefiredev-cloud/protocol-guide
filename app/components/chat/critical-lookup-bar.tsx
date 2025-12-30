'use client';

import { memo, useCallback } from 'react';

/**
 * Quick lookup categories for common LA County EMS scenarios
 * Each button submits a predefined query immediately
 */
const QUICK_LOOKUPS = [
  {
    id: 'peds-trauma',
    label: 'Peds Trauma',
    query: 'pediatric trauma assessment and treatment protocol',
  },
  {
    id: 'stemi',
    label: 'STEMI',
    query: 'STEMI protocol 12-lead criteria and treatment',
  },
  {
    id: 'stroke',
    label: 'Stroke',
    query: 'stroke assessment FAST LAMS transport criteria',
  },
  {
    id: 'cardiac-arrest',
    label: 'Cardiac Arrest',
    query: 'cardiac arrest ACLS algorithm medications',
  },
  {
    id: 'airway',
    label: 'Airway',
    query: 'difficult airway management protocol',
  },
  {
    id: 'meds',
    label: 'Meds',
    query: 'medication dosing quick reference',
  },
] as const;

interface CriticalLookupBarProps {
  /** Callback when a quick lookup is selected */
  onQuerySubmit: (query: string) => void;
  /** Whether input is currently disabled */
  disabled?: boolean;
}

/**
 * Horizontal scrolling bar of critical lookup buttons
 * Provides one-tap access to common protocol queries
 */
export const CriticalLookupBar = memo(function CriticalLookupBar({
  onQuerySubmit,
  disabled = false,
}: CriticalLookupBarProps) {
  const handleClick = useCallback(
    (query: string) => {
      if (!disabled) {
        onQuerySubmit(query);
      }
    },
    [onQuerySubmit, disabled]
  );

  return (
    <div className="critical-lookup-bar" role="navigation" aria-label="Quick protocol lookups">
      <div className="critical-lookup-scroll">
        {QUICK_LOOKUPS.map((lookup) => (
          <button
            key={lookup.id}
            type="button"
            className={`critical-lookup-pill ${lookup.color} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleClick(lookup.query)}
            disabled={disabled}
            aria-label={`Quick lookup: ${lookup.label}`}
          >
            {lookup.label}
          </button>
        ))}
      </div>
    </div>
  );
});
