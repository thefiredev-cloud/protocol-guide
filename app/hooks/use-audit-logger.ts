'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  getAuditQueue,
  initClientAuditQueue,
  logClientAudit,
} from '../../lib/audit/client-audit-queue';
import type { AuditAction, AuditOutcome } from '../../lib/audit/types';

/**
 * React hook for client-side audit logging
 * Provides easy interface for logging user actions with HIPAA compliance
 */
export function useAuditLogger() {
  const initialized = useRef(false);

  // Initialize audit queue on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initClientAuditQueue().catch(console.error);
    }
  }, []);

  /**
   * Log a protocol view event
   */
  const logProtocolView = useCallback(
    async (protocolId: string, protocolName?: string, durationMs?: number) => {
      await logClientAudit('protocol.view', protocolId, 'success', { protocolName }, durationMs);
    },
    []
  );

  /**
   * Log a protocol search event
   */
  const logProtocolSearch = useCallback(
    async (searchTermLength: number, resultCount: number, durationMs?: number) => {
      await logClientAudit(
        'protocol.search',
        'search',
        'success',
        { searchTermLength, resultCount },
        durationMs
      );
    },
    []
  );

  /**
   * Log a knowledge base search event
   */
  const logKBSearch = useCallback(
    async (queryLength: number, resultCount: number, durationMs?: number) => {
      await logClientAudit(
        'client.kb.search',
        'kb_search',
        'success',
        { queryLength, resultCount },
        durationMs
      );
    },
    []
  );

  /**
   * Log voice input start
   */
  const logVoiceStart = useCallback(async () => {
    await logClientAudit('client.voice.start', 'voice_input', 'success');
  }, []);

  /**
   * Log voice transcription completion
   */
  const logVoiceTranscribe = useCallback(
    async (
      outcome: AuditOutcome,
      durationMs?: number,
      transcriptLength?: number,
      errorMessage?: string
    ) => {
      await logClientAudit(
        'client.voice.transcribe',
        'voice_transcription',
        outcome,
        { transcriptLength },
        durationMs,
        errorMessage
      );
    },
    []
  );

  /**
   * Log offline query attempt
   */
  const logOfflineQuery = useCallback(
    async (queryLength: number, outcome: AuditOutcome, errorMessage?: string) => {
      await logClientAudit(
        'client.offline.query',
        'offline_query',
        outcome,
        { queryLength },
        undefined,
        errorMessage
      );
    },
    []
  );

  /**
   * Log protocol expand/collapse
   */
  const logProtocolExpand = useCallback(async (protocolId: string, expanded: boolean) => {
    await logClientAudit('client.protocol.expand', protocolId, 'success', { expanded });
  }, []);

  /**
   * Generic audit log function for custom events
   */
  const log = useCallback(
    async (
      action: AuditAction,
      resource: string,
      outcome: AuditOutcome,
      metadata?: Record<string, unknown>,
      durationMs?: number,
      errorMessage?: string
    ) => {
      await logClientAudit(action, resource, outcome, metadata, durationMs, errorMessage);
    },
    []
  );

  /**
   * Force sync pending events to server
   */
  const syncNow = useCallback(async () => {
    const queue = getAuditQueue();
    return queue.syncEvents();
  }, []);

  /**
   * Get count of pending (unsynced) events
   */
  const getPendingCount = useCallback(async () => {
    const queue = getAuditQueue();
    return queue.getPendingCount();
  }, []);

  return {
    // Specific logging functions
    logProtocolView,
    logProtocolSearch,
    logKBSearch,
    logVoiceStart,
    logVoiceTranscribe,
    logOfflineQuery,
    logProtocolExpand,
    // Generic log function
    log,
    // Utility functions
    syncNow,
    getPendingCount,
  };
}
