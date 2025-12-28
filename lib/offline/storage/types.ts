/**
 * Protocol-Guide.com IndexedDB Schema Definitions
 *
 * Complete TypeScript interfaces for offline storage databases.
 * Single source of truth for IndexedDB schema.
 *
 * @version 2.0.0
 */

import type { DBSchema } from 'idb';

// ============================================================================
// ENUMS & TYPE ALIASES
// ============================================================================

export type SyncStatus = 'pending' | 'processing' | 'failed' | 'succeeded';

export type OperationType =
  | 'protocol.bookmark'
  | 'protocol.unbookmark'
  | 'protocol.note.update'
  | 'chat.message.create'
  | 'chat.session.create'
  | 'audit.log'
  | 'imagetrend.narrative.export'
  | 'user.preference.update';

export type ConflictStrategy = 'server_wins' | 'client_wins' | 'manual' | 'merge';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ProviderLevel = 'emt' | 'paramedic' | 'supervisor' | 'admin';

export type Gender = 'male' | 'female' | 'other' | 'unknown';

export type AgeUnit = 'years' | 'months' | 'days';

export type WeightUnit = 'kg' | 'lbs';

export type NarrativeFormat = 'nemsis' | 'plain' | 'structured';

export type ConnectionType = 'embedded' | 'standalone';

// ============================================================================
// DATABASE 1: SAVED PROTOCOLS (medic-bot-protocols v2)
// ============================================================================

export interface SavedProtocol {
  // Primary key
  tp_code: string;

  // Protocol metadata
  tp_name: string;
  category: string;
  effective_date: string;
  version: number;
  is_current: boolean;

  // Full protocol content
  content: ProtocolContent;

  // Medications for this protocol
  medications: ProtocolMedication[];

  // User bookmark metadata
  bookmarked_at: string;
  last_accessed: string;
  access_count: number;
  user_notes: string | null;

  // Sync tracking
  synced_at: string;
  server_version: number;
  local_modifications: boolean;
}

export interface ProtocolContent {
  chief_complaints: string[];
  provider_impressions: string[];
  base_contact_required: boolean;
  base_contact_criteria: string | null;
  positioning: string | null;
  monitoring: string[];
  contraindications: string[];
  warnings: string[];
  transport_destinations: Record<string, unknown> | null;
  chunks: ProtocolChunk[];
}

export interface ProtocolChunk {
  id: string;
  title: string;
  content: string;
}

export interface ProtocolMedication {
  mcg_number: string;
  medication_name: string;
  generic_name: string | null;
  medication_class: string | null;
  adult_dose: Record<string, unknown> | null;
  pediatric_dose: Record<string, unknown> | null;
  neonatal_dose: Record<string, unknown> | null;
  routes: string[];
  concentration: string | null;
  max_dose: string | null;
  contraindications: string[];
  adverse_effects: string[];
  drug_interactions: string[];
}

export interface ProtocolSearchCache {
  id: string; // format: `${query}:${category}:${timestamp}`
  query: string;
  category: string | null;
  filters: SearchFilters;
  results: SearchResult[];
  created_at: string;
  expires_at: string;
  hit_count: number;
}

export interface SearchFilters {
  provider_level?: ProviderLevel;
  requires_base_contact?: boolean;
  category?: string;
}

export interface SearchResult {
  tp_code: string;
  tp_name: string;
  category: string;
  relevance_score: number;
  snippet: string;
}

export interface IDBProtocolDatabase extends DBSchema {
  'saved-protocols': {
    key: string;
    value: SavedProtocol;
    indexes: {
      'by-category': string;
      'by-accessed': string;
      'by-synced': string;
      'by-modified': string;
    };
  };

  'protocol-search-cache': {
    key: string;
    value: ProtocolSearchCache;
    indexes: {
      'by-query': string;
      'by-expires': string;
    };
  };
}

// ============================================================================
// DATABASE 2: SYNC MANAGEMENT (medic-bot-sync v3)
// ============================================================================

export interface SyncQueueItem {
  id: string;
  operation_type: OperationType;
  payload: Record<string, unknown>;
  resource_type: string;
  resource_id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  queued_at: string;
  last_attempt_at: string | null;
  attempts: number;
  max_attempts: number;
  next_retry_at: string | null;
  status: SyncStatus;
  error_message: string | null;
  conflict_strategy: ConflictStrategy;
  requires_user_action: boolean;
}

export interface OfflineManifest {
  key: string; // singleton: 'current'
  app_version: string;
  schema_version: number;
  last_full_sync: string | null;
  last_incremental_sync: string | null;
  last_successful_sync: string | null;
  cached_protocols: CachedDataStats;
  cached_kb_chunks: KBChunkStats;
  cached_drugs: DrugStats;
  pending_operations: number;
  failed_operations: number;
  storage_quota: StorageQuota;
  features: FeatureFlags;
  updated_at: string;
  device_fingerprint: string;
}

export interface CachedDataStats {
  count: number;
  total_size_bytes: number;
  oldest_cache: string;
  newest_cache: string;
}

export interface KBChunkStats {
  categories: string[];
  count: number;
  total_size_bytes: number;
}

export interface DrugStats {
  count: number;
  total_size_bytes: number;
  last_updated: string;
}

export interface StorageQuota {
  usage: number;
  quota: number;
  percentage: number;
}

export interface FeatureFlags {
  offline_chat: boolean;
  offline_search: boolean;
  imagetrend_integration: boolean;
}

export interface ConflictLog {
  id: string;
  resource_type: string;
  resource_id: string;
  local_version: ConflictVersion;
  server_version: ConflictVersion;
  resolution_strategy: 'auto' | 'manual';
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  winning_version: 'local' | 'server' | 'merged';
  created_at: string;
  user_notified: boolean;
}

export interface ConflictVersion {
  data: Record<string, unknown>;
  timestamp: string;
  version: number;
}

export interface IDBSyncDatabase extends DBSchema {
  'sync-queue': {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-status': SyncStatus;
      'by-created': string;
      'by-operation': OperationType;
      'by-retry': string;
      'by-user': string;
    };
  };

  'offline-manifest': {
    key: string;
    value: OfflineManifest;
  };

  'conflict-log': {
    key: string;
    value: ConflictLog;
    indexes: {
      'by-resolved': string;
      'by-resource': [string, string];
    };
  };
}

// ============================================================================
// DATABASE 3: CHAT & IMAGETREND (medic-bot-chat v2)
// ============================================================================

export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  user_id: string | null;
  device_fingerprint: string | null;
  provider_level: ProviderLevel | null;
  imagetrend_incident_id: string | null;
  imagetrend_patient_id: string | null;
  imagetrend_synced: boolean;
  imagetrend_last_sync: string | null;
  message_count: number;
  protocols_referenced: string[];
  synced_to_server: boolean;
  last_synced_at: string | null;
  pending_changes: boolean;
  metadata: Record<string, unknown> | null;
  deleted_at: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  citations: Citation[] | null;
  protocols_referenced: string[] | null;
  response_time_ms: number | null;
  tokens_used: number | null;
  is_sanitized: boolean;
  original_content_hash: string | null;
  created_at: string;
  deleted_at: string | null;
  synced_to_server: boolean;
  sync_attempts: number;
  last_sync_error: string | null;
}

export interface Citation {
  title: string;
  category: string;
  subcategory: string | null;
  tp_code: string | null;
  confidence?: number;
}

export interface ImageTrendState {
  key: string; // singleton: 'current'
  connected: boolean;
  connection_type: ConnectionType | null;
  last_connected: string | null;
  last_disconnected: string | null;
  token: string | null;
  token_expires_at: string | null;
  refresh_token: string | null;
  active_incident: ActiveIncident | null;
  patient_context: PatientContext | null;
  pending_narrative_updates: NarrativeUpdate[];
  updated_at: string;
  device_info: DeviceInfo;
}

export interface ActiveIncident {
  incident_id: string | null;
  incident_number: string | null;
  patient_id: string | null;
  started_at: string | null;
}

export interface PatientContext {
  demographics: PatientDemographics;
  vitals: VitalSigns[];
  chief_complaint: string | null;
  allergies: string[];
  medications: string[];
  medical_history: string[];
}

export interface PatientDemographics {
  age: number | null;
  age_unit: AgeUnit | null;
  gender: Gender | null;
  weight: number | null;
  weight_unit: WeightUnit | null;
}

export interface VitalSigns {
  timestamp: string;
  heart_rate: number | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  temperature: number | null;
  gcs: number | null;
}

export interface NarrativeUpdate {
  timestamp: string;
  content: string;
  format: NarrativeFormat;
}

export interface DeviceInfo {
  user_agent: string;
  platform: string;
}

export interface IDBChatDatabase extends DBSchema {
  'chat-sessions': {
    key: string;
    value: ChatSession;
    indexes: {
      'by-updated': string;
      'by-user': string;
      'by-imagetrend': string;
      'by-synced': string;
    };
  };

  'chat-messages': {
    key: string;
    value: ChatMessage;
    indexes: {
      'by-session': string;
      'by-created': string;
      'by-synced': string;
      'by-protocol': string;
    };
  };

  'imagetrend-state': {
    key: string;
    value: ImageTrendState;
  };
}

// ============================================================================
// SYNC QUEUE MANAGER TYPES
// ============================================================================

export interface SyncQueueStatus {
  pending: number;
  syncing: number;
  failed: number;
  conflicts: number;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: number | null;
  circuitState: 'closed' | 'open' | 'half-open';
}

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
}

export interface SyncOperation<T = unknown> {
  entityType: string;
  entityId: string;
  operationType: OperationType;
  payload: T;
  priority: 'high' | 'normal' | 'low';
  maxAttempts?: number;
  conflictStrategy?: ConflictStrategy;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DATABASE_NAMES = {
  PROTOCOLS: 'medic-bot-protocols',
  SYNC: 'medic-bot-sync',
  CHAT: 'medic-bot-chat',
  KB: 'medic-bot-kb',
  DRUGS: 'medic-bot-drugs',
  AUDIT: 'medic-bot-audit',
} as const;

export const DATABASE_VERSIONS = {
  PROTOCOLS: 2,
  SYNC: 3,
  CHAT: 2,
  KB: 2,
  DRUGS: 1,
  AUDIT: 1,
} as const;

export const STORAGE_LIMITS = {
  MAX_PROTOCOLS: 200,
  MAX_MESSAGES_PER_SESSION: 100,
  MAX_SESSIONS: 20,
  MAX_SYNC_QUEUE_SIZE: 200,
  MAX_SEARCH_CACHE_AGE_MS: 3600000, // 1 hour
  MAX_PROTOCOL_AGE_DAYS: 30,
  QUOTA_WARNING_THRESHOLD: 0.6, // 60%
  QUOTA_CRITICAL_THRESHOLD: 0.8, // 80%
} as const;

export const SYNC_CONFIG = {
  MAX_RETRY_ATTEMPTS: 5,
  RETRY_DELAYS: [1000, 5000, 30000, 120000, 300000], // Exponential backoff
  BATCH_SIZE: 10,
  SYNC_INTERVAL_MS: 30000, // 30 seconds
} as const;
