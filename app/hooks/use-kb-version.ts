'use client';

import { useCallback, useEffect, useState } from 'react';

import { checkKBVersion, type KBVersionResult, type KBVersionStatus } from '../../lib/kb/version-checker';

type UseKBVersionResult = {
  status: KBVersionStatus;
  message?: string;
  isStale: boolean;
  checkNow: () => Promise<void>;
  dismiss: () => void;
};

/**
 * React hook for KB version checking
 * Checks on mount and when coming back online
 */
export function useKBVersion(): UseKBVersionResult {
  const [result, setResult] = useState<KBVersionResult>({ status: 'unknown' });
  const [dismissed, setDismissed] = useState(false);

  const performCheck = useCallback(async (force = false) => {
    setResult({ status: 'checking' });
    const checkResult = await checkKBVersion(force);
    setResult(checkResult);
    // Reset dismissed if new stale version detected
    if (checkResult.status === 'stale') {
      setDismissed(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    performCheck();
  }, [performCheck]);

  // Check when coming back online
  useEffect(() => {
    const handleOnline = () => {
      performCheck(true);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [performCheck]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    status: result.status,
    message: dismissed ? undefined : result.message,
    isStale: result.status === 'stale' && !dismissed,
    checkNow: () => performCheck(true),
    dismiss,
  };
}
