'use client';

/**
 * ImageTrend Context Provider
 * Manages ImageTrend Elite ePCR integration state, connection, and PCR operations
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useOffline } from './offline-context';

import type {
  ActiveIncident,
  PatientContext,
  NarrativeUpdate,
  ImageTrendState,
  OperationType,
} from '@/lib/offline/storage/types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * PCR (Patient Care Report) structure from ImageTrend
 */
export interface PCR {
  id: string;
  incident_id: string;
  incident_number: string;
  patient_id: string | null;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'submitted' | 'approved';
  assigned_to: string | null;
}

/**
 * Extended Incident information
 */
export interface Incident extends ActiveIncident {
  location: string | null;
  dispatch_time: string | null;
  arrival_time: string | null;
  unit_number: string | null;
}

/**
 * Protocol usage tracking for linking to PCR
 */
export interface ProtocolUsage {
  protocol_id: string;
  tp_code: string;
  tp_name: string;
  accessed_at: string;
  linked_to_pcr: boolean;
}

/**
 * Connection status response from API
 */
interface ConnectionStatusResponse {
  connected: boolean;
  agency_id: string | null;
  agency_name: string | null;
  token_expires_at: string | null;
  error?: string;
}

/**
 * ImageTrend context value
 */
interface ImageTrendContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  agencyId: string | null;
  agencyName: string | null;

  // Active PCR state
  activePCR: PCR | null;
  activeIncident: Incident | null;
  patientContext: PatientContext | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshConnection: () => Promise<void>;

  // PCR actions
  setActivePCR: (pcr: PCR | null) => void;
  linkProtocol: (protocolId: string, usage: ProtocolUsage) => Promise<void>;
  updateNarrative: (update: NarrativeUpdate) => Promise<void>;

  // Sync state
  pendingLinks: number;
  lastSyncAt: number | null;
}

const ImageTrendContext = createContext<ImageTrendContextType | undefined>(
  undefined
);

/**
 * Hook to access ImageTrend context
 * @throws Error if used outside ImageTrendProvider
 */
export function useImageTrend(): ImageTrendContextType {
  const context = useContext(ImageTrendContext);
  if (!context) {
    throw new Error('useImageTrend must be used within an ImageTrendProvider');
  }
  return context;
}

interface ImageTrendProviderProps {
  children: React.ReactNode;
}

/**
 * ImageTrend provider component
 * Wraps application to provide ImageTrend integration state management
 */
export function ImageTrendProvider({ children }: ImageTrendProviderProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null);

  // Active PCR state
  const [activePCR, setActivePCRState] = useState<PCR | null>(null);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [patientContext, setPatientContext] = useState<PatientContext | null>(
    null
  );

  // Sync state
  const [pendingLinks, setPendingLinks] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  // Offline context for queueing operations
  const { queueOperation, isOnline } = useOffline();

  /**
   * Check connection status with ImageTrend
   */
  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/imagetrend/oauth/status', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ConnectionStatusResponse = await response.json();

      setIsConnected(data.connected);
      setAgencyId(data.agency_id);
      setAgencyName(data.agency_name);
      setTokenExpiresAt(data.token_expires_at);
      setConnectionError(data.error || null);

      return data;
    } catch (error) {
      console.error('[ImageTrend] Connection status check failed:', error);
      setIsConnected(false);
      setConnectionError(
        error instanceof Error ? error.message : 'Connection check failed'
      );
      throw error;
    }
  }, []);

  /**
   * Initialize connection status on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsConnecting(true);
        await checkConnectionStatus();
        console.log('[ImageTrend] Context initialized');
      } catch (error) {
        console.error('[ImageTrend] Initialization error:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    initialize();
  }, [checkConnectionStatus]);

  /**
   * Monitor token expiration and refresh connection
   */
  useEffect(() => {
    if (!tokenExpiresAt || !isConnected) {
      return;
    }

    const expirationTime = new Date(tokenExpiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expirationTime - now;

    // Refresh 5 minutes before expiration
    const refreshBuffer = 5 * 60 * 1000;
    const refreshTime = timeUntilExpiry - refreshBuffer;

    if (refreshTime > 0) {
      const timeout = setTimeout(() => {
        console.log('[ImageTrend] Refreshing connection (token expiring soon)');
        refreshConnection().catch(console.error);
      }, refreshTime);

      return () => clearTimeout(timeout);
    }
  }, [tokenExpiresAt, isConnected]);

  /**
   * Connect to ImageTrend (initiate OAuth flow)
   */
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Redirect to OAuth authorization
      window.location.href = '/api/integrations/imagetrend/oauth/authorize';
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Connection failed';
      setConnectionError(message);
      console.error('[ImageTrend] Connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect from ImageTrend
   */
  const disconnect = useCallback(async () => {
    try {
      setIsConnecting(true);

      const response = await fetch('/api/integrations/imagetrend/oauth/disconnect', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Clear local state
      setIsConnected(false);
      setAgencyId(null);
      setAgencyName(null);
      setTokenExpiresAt(null);
      setActivePCRState(null);
      setActiveIncident(null);
      setPatientContext(null);
      setConnectionError(null);

      console.log('[ImageTrend] Disconnected successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Disconnect failed';
      setConnectionError(message);
      console.error('[ImageTrend] Disconnect error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Refresh connection status
   */
  const refreshConnection = useCallback(async () => {
    try {
      setIsConnecting(true);
      await checkConnectionStatus();
      console.log('[ImageTrend] Connection refreshed');
    } catch (error) {
      console.error('[ImageTrend] Refresh error:', error);
      // Mark as disconnected on refresh failure
      setIsConnected(false);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [checkConnectionStatus]);

  /**
   * Set active PCR and load associated data
   */
  const setActivePCR = useCallback(async (pcr: PCR | null) => {
    setActivePCRState(pcr);

    if (pcr) {
      // Load incident and patient context
      // In a real implementation, this would fetch from ImageTrend API
      console.log('[ImageTrend] Active PCR set:', pcr.id);

      // TODO: Fetch incident details
      // TODO: Fetch patient context
    } else {
      setActiveIncident(null);
      setPatientContext(null);
    }
  }, []);

  /**
   * Link a protocol to the active PCR
   */
  const linkProtocol = useCallback(
    async (protocolId: string, usage: ProtocolUsage) => {
      if (!activePCR) {
        throw new Error('No active PCR to link protocol to');
      }

      const operation = {
        entityType: 'protocol_link',
        entityId: protocolId,
        operationType: 'imagetrend.narrative.export' as OperationType,
        payload: {
          pcr_id: activePCR.id,
          incident_id: activePCR.incident_id,
          protocol_id: protocolId,
          usage,
          linked_at: new Date().toISOString(),
        },
        priority: 'normal' as const,
      };

      if (isOnline && isConnected) {
        // Immediate sync if online and connected
        try {
          const response = await fetch('/api/integrations/imagetrend/link-protocol', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(operation.payload),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          console.log('[ImageTrend] Protocol linked successfully:', protocolId);
          setLastSyncAt(Date.now());
        } catch (error) {
          console.error('[ImageTrend] Link protocol error:', error);
          // Queue for later if immediate sync fails
          await queueOperation(operation);
          setPendingLinks((prev) => prev + 1);
        }
      } else {
        // Queue for offline sync
        await queueOperation(operation);
        setPendingLinks((prev) => prev + 1);
        console.log('[ImageTrend] Protocol link queued for sync:', protocolId);
      }
    },
    [activePCR, isOnline, isConnected, queueOperation]
  );

  /**
   * Update PCR narrative
   */
  const updateNarrative = useCallback(
    async (update: NarrativeUpdate) => {
      if (!activePCR) {
        throw new Error('No active PCR to update narrative for');
      }

      const operation = {
        entityType: 'narrative_update',
        entityId: activePCR.id,
        operationType: 'imagetrend.narrative.export' as OperationType,
        payload: {
          pcr_id: activePCR.id,
          incident_id: activePCR.incident_id,
          update,
        },
        priority: 'high' as const,
      };

      if (isOnline && isConnected) {
        // Immediate sync if online and connected
        try {
          const response = await fetch('/api/integrations/imagetrend/update-narrative', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(operation.payload),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          console.log('[ImageTrend] Narrative updated successfully');
          setLastSyncAt(Date.now());
        } catch (error) {
          console.error('[ImageTrend] Update narrative error:', error);
          // Queue for later if immediate sync fails
          await queueOperation(operation);
        }
      } else {
        // Queue for offline sync
        await queueOperation(operation);
        console.log('[ImageTrend] Narrative update queued for sync');
      }
    },
    [activePCR, isOnline, isConnected, queueOperation]
  );

  /**
   * Monitor pending links from offline queue
   */
  useEffect(() => {
    // This would integrate with the offline sync manager
    // to track pending ImageTrend operations
    // For now, we'll just reset when coming online
    if (isOnline && pendingLinks > 0) {
      console.log('[ImageTrend] Online, pending operations may sync');
    }
  }, [isOnline, pendingLinks]);

  return (
    <ImageTrendContext.Provider
      value={{
        isConnected,
        isConnecting,
        connectionError,
        agencyId,
        agencyName,
        activePCR,
        activeIncident,
        patientContext,
        connect,
        disconnect,
        refreshConnection,
        setActivePCR,
        linkProtocol,
        updateNarrative,
        pendingLinks,
        lastSyncAt,
      }}
    >
      {children}
    </ImageTrendContext.Provider>
  );
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook to check ImageTrend connection status
 */
export function useImageTrendConnection(): {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  agencyId: string | null;
  agencyName: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshConnection: () => Promise<void>;
} {
  const {
    isConnected,
    isConnecting,
    connectionError,
    agencyId,
    agencyName,
    connect,
    disconnect,
    refreshConnection,
  } = useImageTrend();

  return {
    isConnected,
    isConnecting,
    connectionError,
    agencyId,
    agencyName,
    connect,
    disconnect,
    refreshConnection,
  };
}

/**
 * Hook to access active PCR state
 */
export function useActivePCR(): {
  activePCR: PCR | null;
  activeIncident: Incident | null;
  patientContext: PatientContext | null;
  setActivePCR: (pcr: PCR | null) => void;
  linkProtocol: (protocolId: string, usage: ProtocolUsage) => Promise<void>;
  updateNarrative: (update: NarrativeUpdate) => Promise<void>;
} {
  const {
    activePCR,
    activeIncident,
    patientContext,
    setActivePCR,
    linkProtocol,
    updateNarrative,
  } = useImageTrend();

  return {
    activePCR,
    activeIncident,
    patientContext,
    setActivePCR,
    linkProtocol,
    updateNarrative,
  };
}

/**
 * Hook to check if protocol linking is available
 */
export function useCanLinkProtocol(): boolean {
  const { isConnected, activePCR } = useImageTrend();
  return isConnected && activePCR !== null;
}

/**
 * Hook to get ImageTrend sync status
 */
export function useImageTrendSyncStatus(): {
  pendingLinks: number;
  lastSyncAt: number | null;
  hasPendingSync: boolean;
} {
  const { pendingLinks, lastSyncAt } = useImageTrend();

  return {
    pendingLinks,
    lastSyncAt,
    hasPendingSync: pendingLinks > 0,
  };
}
