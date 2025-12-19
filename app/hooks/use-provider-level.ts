"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * LA County EMS Provider Levels
 * Per Policy 802 (EMT Scope) and Policy 803 (Paramedic Scope)
 */
export type ProviderLevel = "EMT" | "Paramedic";

const STORAGE_KEY = "county-medic-provider-level";
const DEFAULT_LEVEL: ProviderLevel = "Paramedic";

/**
 * Hook for managing provider level (EMT/Paramedic) scope of practice.
 * Persists to localStorage. Defaults to Paramedic (LA County Fire primary users).
 */
export function useProviderLevel() {
  const [providerLevel, setProviderLevelState] = useState<ProviderLevel>(DEFAULT_LEVEL);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as ProviderLevel | null;
      if (stored === "EMT" || stored === "Paramedic") {
        setProviderLevelState(stored);
      }
      setIsLoaded(true);
    }
  }, []);

  const setProviderLevel = useCallback((level: ProviderLevel) => {
    setProviderLevelState(level);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, level);
    }
  }, []);

  const toggleProviderLevel = useCallback(() => {
    const newLevel = providerLevel === "Paramedic" ? "EMT" : "Paramedic";
    setProviderLevel(newLevel);
  }, [providerLevel, setProviderLevel]);

  return {
    providerLevel,
    setProviderLevel,
    toggleProviderLevel,
    isEMT: providerLevel === "EMT",
    isParamedic: providerLevel === "Paramedic",
    isLoaded,
  };
}
