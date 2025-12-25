/**
 * Knowledge Base Version Checker
 * Compares cached KB version with server to notify users of stale protocols
 */

const KB_VERSION_KEY = 'kb-version';
const KB_LAST_CHECK_KEY = 'kb-last-check';
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export type KBVersionStatus = 'current' | 'stale' | 'unknown' | 'checking';

export type KBVersionInfo = {
  version: string;
  lastUpdated: string;
  protocolCount?: number;
};

export type KBVersionResult = {
  status: KBVersionStatus;
  cachedVersion?: string;
  serverVersion?: string;
  message?: string;
};

/**
 * Get cached KB version from localStorage
 */
export function getCachedKBVersion(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(KB_VERSION_KEY);
}

/**
 * Save KB version to localStorage
 */
export function setCachedKBVersion(version: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KB_VERSION_KEY, version);
  localStorage.setItem(KB_LAST_CHECK_KEY, Date.now().toString());
}

/**
 * Check if we should perform a version check (throttled)
 */
function shouldCheckVersion(): boolean {
  if (typeof localStorage === 'undefined') return true;

  const lastCheck = localStorage.getItem(KB_LAST_CHECK_KEY);
  if (!lastCheck) return true;

  const elapsed = Date.now() - parseInt(lastCheck, 10);
  return elapsed >= CHECK_INTERVAL_MS;
}

/**
 * Fetch current KB version from server
 */
async function fetchServerVersion(): Promise<KBVersionInfo | null> {
  try {
    const response = await fetch('/api/kb/version', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('[KBVersion] Server returned', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('[KBVersion] Failed to fetch version:', error);
    return null;
  }
}

/**
 * Check KB version and return status
 */
export async function checkKBVersion(force = false): Promise<KBVersionResult> {
  // Skip if recently checked (unless forced)
  if (!force && !shouldCheckVersion()) {
    const cached = getCachedKBVersion();
    return {
      status: cached ? 'current' : 'unknown',
      cachedVersion: cached || undefined,
    };
  }

  // Fetch server version
  const serverInfo = await fetchServerVersion();

  if (!serverInfo) {
    return {
      status: 'unknown',
      cachedVersion: getCachedKBVersion() || undefined,
      message: 'Unable to verify protocol version',
    };
  }

  const cachedVersion = getCachedKBVersion();
  const serverVersion = serverInfo.version;

  // Update cache with server version
  setCachedKBVersion(serverVersion);

  // Compare versions
  if (!cachedVersion) {
    // First time - no cached version
    return {
      status: 'current',
      serverVersion,
      message: `Protocols loaded (v${serverVersion})`,
    };
  }

  if (cachedVersion !== serverVersion) {
    return {
      status: 'stale',
      cachedVersion,
      serverVersion,
      message: `Protocol update available (${cachedVersion} → ${serverVersion})`,
    };
  }

  return {
    status: 'current',
    cachedVersion,
    serverVersion,
  };
}

/**
 * React hook for KB version checking
 */
export function createKBVersionChecker() {
  let checkPromise: Promise<KBVersionResult> | null = null;

  return {
    /**
     * Check version (deduped - returns same promise if already checking)
     */
    check: async (force = false): Promise<KBVersionResult> => {
      if (checkPromise && !force) {
        return checkPromise;
      }
      checkPromise = checkKBVersion(force);
      const result = await checkPromise;
      checkPromise = null;
      return result;
    },

    /**
     * Get cached version without server check
     */
    getCached: (): string | null => getCachedKBVersion(),
  };
}
