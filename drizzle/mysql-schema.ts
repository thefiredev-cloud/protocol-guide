/**
 * MySQL/TiDB Schema for Protocol Guide
 *
 * This schema mirrors the PostgreSQL schema (schema.ts) for MySQL/TiDB compatibility.
 * PostgreSQL (Supabase) is the PRIMARY database - this schema is for:
 * - Legacy data imports
 * - Batch processing
 * - Analytics backup
 *
 * IMPORTANT: Keep this schema in sync with schema.ts (PostgreSQL)
 * Any schema changes should be made to schema.ts FIRST, then mirrored here.
 *
 * @see /drizzle/schema.ts - PostgreSQL schema (SOURCE OF TRUTH)
 * @see /drizzle/shared-types.ts - Shared type definitions
 */

import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  index,
  longtext,
  json,
  tinyint,
  date,
  decimal,
  float,
  unique,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// =============================================================================
// CORE TABLES
// =============================================================================

export const users = mysqlTable("users", {
  id: int().autoincrement().primaryKey().notNull(),
  openId: varchar({ length: 64 }).notNull().unique(),
  name: text(),
  email: varchar({ length: 320 }),
  loginMethod: varchar({ length: 64 }),
  role: mysqlEnum(['user', 'admin']).default('user').notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  tier: mysqlEnum(['free', 'pro', 'enterprise']).default('free').notNull(),
  queryCountToday: int().notNull().default(0),
  lastQueryDate: varchar({ length: 10 }),
  selectedCountyId: int(),
  stripeCustomerId: varchar({ length: 255 }),
  subscriptionId: varchar({ length: 255 }),
  subscriptionStatus: varchar({ length: 50 }),
  subscriptionEndDate: timestamp({ mode: 'string' }),
  homeCountyId: int(),
  supabaseId: varchar({ length: 36 }).unique(),
  disclaimerAcknowledgedAt: timestamp({ mode: 'string' }),
}, (table) => [
  index("idx_users_disclaimer_acknowledged").on(table.disclaimerAcknowledgedAt),
]);

export const counties = mysqlTable("counties", {
  id: int().autoincrement().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  state: varchar({ length: 64 }).notNull(),
  usesStateProtocols: tinyint().notNull().default(0),
  protocolVersion: varchar({ length: 50 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_counties_state").on(table.state),
]);

export const agencies = mysqlTable("agencies", {
  id: int().autoincrement().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 100 }).notNull().unique(),
  stateCode: varchar({ length: 2 }).notNull(),
  state: varchar({ length: 2 }),
  county: varchar({ length: 100 }),
  agencyType: mysqlEnum(['fire_dept', 'ems_agency', 'hospital', 'state_office', 'regional_council']),
  logoUrl: varchar({ length: 500 }),
  contactEmail: varchar({ length: 320 }),
  contactPhone: varchar({ length: 20 }),
  address: text(),
  supabaseAgencyId: int(),
  stripeCustomerId: varchar({ length: 255 }),
  subscriptionTier: mysqlEnum(['starter', 'professional', 'enterprise']).default('starter'),
  subscriptionStatus: varchar({ length: 50 }),
  settings: json(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("idx_agencies_slug").on(table.slug),
  index("idx_agencies_state").on(table.state),
  index("idx_agencies_state_code").on(table.stateCode),
]);

// =============================================================================
// USER-RELATED TABLES
// =============================================================================

export const bookmarks = mysqlTable("bookmarks", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  protocolNumber: varchar({ length: 50 }).notNull(),
  protocolTitle: varchar({ length: 255 }).notNull(),
  section: varchar({ length: 255 }),
  content: text().notNull(),
  agencyId: int(),
  agencyName: varchar({ length: 255 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const feedback = mysqlTable("feedback", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  category: mysqlEnum(['error', 'suggestion', 'general']).notNull(),
  protocolRef: varchar({ length: 255 }),
  countyId: int(),
  subject: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  status: mysqlEnum(['pending', 'reviewed', 'resolved', 'dismissed']).default('pending').notNull(),
  adminNotes: text(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const queries = mysqlTable("queries", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  countyId: int().notNull(),
  queryText: text().notNull(),
  responseText: text(),
  protocolRefs: json(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int(),
  action: varchar({ length: 50 }).notNull(),
  entityType: varchar({ length: 50 }),
  entityId: varchar({ length: 100 }),
  metadata: json(),
  ipAddress: varchar({ length: 45 }),
  userAgent: text(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_audit_logs_user").on(table.userId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_created").on(table.createdAt),
]);

export const userAuthProviders = mysqlTable("user_auth_providers", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  provider: varchar({ length: 50 }).notNull(),
  providerUserId: varchar({ length: 255 }).notNull(),
  accessToken: text(),
  refreshToken: text(),
  expiresAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("idx_auth_providers_user").on(table.userId),
  index("idx_auth_providers_provider").on(table.provider, table.providerUserId),
]);

export const userCounties = mysqlTable("user_counties", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  countyId: int().notNull(),
  isPrimary: tinyint().default(0),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_user_counties_user").on(table.userId),
  index("idx_user_counties_county").on(table.countyId),
]);

export const userStates = mysqlTable("user_states", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  stateCode: varchar({ length: 2 }).notNull(),
  accessLevel: mysqlEnum(['view', 'contribute', 'admin']).default('view'),
  subscribedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
  expiresAt: timestamp({ mode: 'string' }),
}, (table) => [
  index("idx_user_states_user").on(table.userId),
  index("idx_user_states_state").on(table.stateCode),
]);

export const userAgencies = mysqlTable("user_agencies", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  agencyId: int().notNull(),
  accessLevel: mysqlEnum(['view', 'contribute', 'admin']).default('view'),
  isPrimary: tinyint().default(0),
  role: varchar({ length: 100 }),
  verifiedAt: timestamp({ mode: 'string' }),
  subscribedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
  expiresAt: timestamp({ mode: 'string' }),
}, (table) => [
  index("idx_user_agencies_user").on(table.userId),
  index("idx_user_agencies_agency").on(table.agencyId),
]);

export const searchHistory = mysqlTable("search_history", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  countyId: int(),
  searchQuery: text().notNull(),
  resultsCount: int(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_search_history_user").on(table.userId),
  index("idx_search_history_created").on(table.createdAt),
]);

// =============================================================================
// PROTOCOL-RELATED TABLES
// =============================================================================

export const protocolChunks = mysqlTable("protocol_chunks", {
  id: int().autoincrement().primaryKey().notNull(),
  countyId: int().notNull(),
  protocolNumber: varchar({ length: 50 }).notNull(),
  protocolTitle: varchar({ length: 255 }).notNull(),
  section: varchar({ length: 255 }),
  content: longtext().notNull(),
  sourcePdfUrl: varchar({ length: 500 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  protocolEffectiveDate: varchar({ length: 20 }),
  lastVerifiedAt: timestamp({ mode: 'string' }),
  protocolYear: int(),
}, (table) => [
  index("idx_protocols_county").on(table.countyId),
  index("idx_protocols_section").on(table.section),
  index("idx_protocols_number").on(table.protocolNumber),
  index("idx_protocols_year").on(table.protocolYear),
]);

export const protocolVersions = mysqlTable("protocol_versions", {
  id: int().autoincrement().primaryKey().notNull(),
  agencyId: int().notNull(),
  protocolNumber: varchar({ length: 50 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  version: varchar({ length: 20 }).notNull(),
  status: mysqlEnum(['draft', 'review', 'approved', 'published', 'archived']).notNull().default('draft'),
  sourceFileUrl: varchar({ length: 500 }),
  effectiveDate: timestamp({ mode: 'string' }),
  expiresDate: timestamp({ mode: 'string' }),
  approvedBy: int(),
  approvedAt: timestamp({ mode: 'string' }),
  publishedAt: timestamp({ mode: 'string' }),
  publishedBy: int(),
  chunksGenerated: int().default(0),
  metadata: json(),
  changeLog: text(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  createdBy: int().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("idx_protocol_versions_agency").on(table.agencyId),
  index("idx_protocol_versions_status").on(table.status),
]);

export const protocolUploads = mysqlTable("protocol_uploads", {
  id: int().autoincrement().primaryKey().notNull(),
  agencyId: int().notNull(),
  userId: int().notNull(),
  fileName: varchar({ length: 255 }).notNull(),
  fileUrl: varchar({ length: 500 }).notNull(),
  fileSize: int(),
  mimeType: varchar({ length: 100 }),
  status: mysqlEnum(['pending', 'processing', 'chunking', 'embedding', 'completed', 'failed']).default('pending'),
  progress: int().default(0),
  chunksCreated: int().default(0),
  errorMessage: text(),
  processingStartedAt: timestamp({ mode: 'string' }),
  completedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_protocol_uploads_agency").on(table.agencyId),
  index("idx_protocol_uploads_user").on(table.userId),
]);

// =============================================================================
// AGENCY-RELATED TABLES
// =============================================================================

export const agencyMembers = mysqlTable("agency_members", {
  id: int().autoincrement().primaryKey().notNull(),
  agencyId: int().notNull(),
  userId: int().notNull(),
  role: mysqlEnum(['owner', 'admin', 'protocol_author', 'member']).notNull().default('member'),
  invitedBy: int(),
  invitedAt: timestamp({ mode: 'string' }),
  acceptedAt: timestamp({ mode: 'string' }),
  status: mysqlEnum(['pending', 'active', 'suspended']).default('pending'),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_agency_members_agency").on(table.agencyId),
  index("idx_agency_members_user").on(table.userId),
]);

// =============================================================================
// CONTACT & FEEDBACK
// =============================================================================

export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int().autoincrement().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 320 }).notNull(),
  message: text().notNull(),
  status: mysqlEnum(['pending', 'reviewed', 'resolved']).default('pending').notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

// =============================================================================
// INTEGRATION & EXTERNAL LOGS
// =============================================================================

/**
 * Integration access logs for partner analytics
 *
 * HIPAA COMPLIANCE (2026-01-23):
 * This table intentionally does NOT store PHI (Protected Health Information).
 * DO NOT re-add any patient-identifying fields to this table.
 */
export const integrationLogs = mysqlTable("integration_logs", {
  id: int().autoincrement().primaryKey().notNull(),
  partner: mysqlEnum(['imagetrend', 'esos', 'zoll', 'emscloud', 'none']).notNull(),
  agencyId: varchar({ length: 100 }),
  agencyName: varchar({ length: 255 }),
  searchTerm: varchar({ length: 500 }),
  responseTimeMs: int(),
  resultCount: int(),
  ipAddress: varchar({ length: 45 }),
  userAgent: varchar({ length: 500 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_integration_logs_partner").on(table.partner),
  index("idx_integration_logs_created_at").on(table.createdAt),
  index("idx_integration_logs_agency_id").on(table.agencyId),
]);

export const stripeWebhookEvents = mysqlTable("stripe_webhook_events", {
  id: int().autoincrement().primaryKey().notNull(),
  eventId: varchar({ length: 255 }).notNull().unique(),
  eventType: varchar({ length: 100 }).notNull(),
  payload: json(),
  processed: tinyint().default(0),
  processedAt: timestamp({ mode: 'string' }),
  error: text(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_stripe_events_id").on(table.eventId),
  index("idx_stripe_events_type").on(table.eventType),
  index("idx_stripe_events_processed").on(table.processed),
]);

export const pushTokens = mysqlTable("push_tokens", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  token: text().notNull(),
  platform: varchar({ length: 20 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  lastUsedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("push_tokens_user_idx").on(table.userId),
]);

export const dripEmailsSent = mysqlTable("drip_emails_sent", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  emailType: varchar({ length: 50 }).notNull(),
  sentAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("drip_emails_user_idx").on(table.userId),
  index("drip_emails_type_idx").on(table.emailType),
]);

// =============================================================================
// ANALYTICS TABLES
// =============================================================================

export const analyticsEvents = mysqlTable("analytics_events", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int(),
  sessionId: varchar({ length: 64 }).notNull(),
  eventType: varchar({ length: 50 }).notNull(),
  eventName: varchar({ length: 100 }).notNull(),
  properties: json(),
  deviceType: varchar({ length: 20 }),
  appVersion: varchar({ length: 20 }),
  osVersion: varchar({ length: 20 }),
  screenName: varchar({ length: 100 }),
  referrer: varchar({ length: 255 }),
  ipAddress: varchar({ length: 45 }),
  userAgent: varchar({ length: 500 }),
  timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_analytics_event_type").on(table.eventType),
  index("idx_analytics_user_id").on(table.userId),
  index("idx_analytics_timestamp").on(table.timestamp),
  index("idx_analytics_session").on(table.sessionId),
]);

export const searchAnalytics = mysqlTable("search_analytics", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int(),
  sessionId: varchar({ length: 64 }).notNull(),
  queryText: varchar({ length: 500 }).notNull(),
  queryTokenCount: int(),
  stateFilter: varchar({ length: 2 }),
  agencyId: int(),
  resultsCount: int().notNull(),
  topResultProtocolId: int(),
  topResultScore: float(),
  selectedResultRank: int(),
  selectedProtocolId: int(),
  timeToFirstResult: int(),
  totalSearchTime: int(),
  searchMethod: varchar({ length: 20 }),
  isVoiceQuery: tinyint().default(0),
  voiceTranscriptionTime: int(),
  noResultsFound: tinyint().default(0),
  queryCategory: varchar({ length: 50 }),
  timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_search_user").on(table.userId, table.timestamp),
  index("idx_search_no_results").on(table.noResultsFound, table.timestamp),
  index("idx_search_state").on(table.stateFilter),
  index("idx_search_category").on(table.queryCategory),
]);

export const protocolAccessLogs = mysqlTable("protocol_access_logs", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int(),
  sessionId: varchar({ length: 64 }),
  protocolChunkId: int().notNull(),
  protocolNumber: varchar({ length: 50 }),
  protocolTitle: varchar({ length: 255 }),
  agencyId: int(),
  stateCode: varchar({ length: 2 }),
  accessSource: varchar({ length: 50 }),
  timeSpentSeconds: int(),
  scrollDepth: float(),
  copiedContent: tinyint().default(0),
  sharedProtocol: tinyint().default(0),
  fromSearchQuery: varchar({ length: 500 }),
  searchResultRank: int(),
  timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_access_protocol").on(table.protocolChunkId),
  index("idx_access_user").on(table.userId, table.timestamp),
  index("idx_access_state").on(table.stateCode),
  index("idx_access_source").on(table.accessSource),
]);

export const sessionAnalytics = mysqlTable("session_analytics", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int(),
  sessionId: varchar({ length: 64 }).notNull().unique(),
  deviceType: varchar({ length: 20 }),
  appVersion: varchar({ length: 20 }),
  platform: varchar({ length: 20 }),
  startTime: timestamp({ mode: 'string' }).notNull(),
  endTime: timestamp({ mode: 'string' }),
  durationSeconds: int(),
  searchCount: int().default(0),
  protocolsViewed: int().default(0),
  queriesSubmitted: int().default(0),
  screenTransitions: int().default(0),
  isNewUser: tinyint().default(0),
  userTier: varchar({ length: 20 }),
  referralSource: varchar({ length: 100 }),
  entryScreen: varchar({ length: 100 }),
  exitScreen: varchar({ length: 100 }),
  userCertificationLevel: varchar({ length: 50 }),
}, (table) => [
  index("idx_session_user").on(table.userId),
  index("idx_session_start").on(table.startTime),
]);

export const dailyMetrics = mysqlTable("daily_metrics", {
  id: int().autoincrement().primaryKey().notNull(),
  date: date({ mode: 'string' }).notNull(),
  metricType: varchar({ length: 50 }).notNull(),
  dimension: varchar({ length: 100 }),
  dimensionValue: varchar({ length: 100 }),
  count: int().default(0),
  sumValue: decimal({ precision: 15, scale: 2 }),
  avgValue: decimal({ precision: 15, scale: 4 }),
  p50Value: decimal({ precision: 15, scale: 4 }),
  p95Value: decimal({ precision: 15, scale: 4 }),
  minValue: decimal({ precision: 15, scale: 4 }),
  maxValue: decimal({ precision: 15, scale: 4 }),
}, (table) => [
  index("idx_metrics_date").on(table.date),
  index("idx_metrics_type").on(table.metricType),
  unique("unique_daily_metric").on(table.date, table.metricType, table.dimension, table.dimensionValue),
]);

export const retentionCohorts = mysqlTable("retention_cohorts", {
  id: int().autoincrement().primaryKey().notNull(),
  cohortDate: date({ mode: 'string' }).notNull(),
  cohortType: varchar({ length: 20 }).notNull(),
  cohortSize: int().notNull(),
  d1Retained: int(),
  d7Retained: int(),
  d14Retained: int(),
  d30Retained: int(),
  d60Retained: int(),
  d90Retained: int(),
  segment: varchar({ length: 50 }),
  acquisitionSource: varchar({ length: 100 }),
  calculatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_cohort_date").on(table.cohortDate),
  unique("unique_cohort").on(table.cohortDate, table.cohortType, table.segment),
]);

export const contentGaps = mysqlTable("content_gaps", {
  id: int().autoincrement().primaryKey().notNull(),
  queryPattern: varchar({ length: 500 }).notNull(),
  occurrences: int().default(1),
  lastOccurred: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  firstOccurred: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  statesRequested: json(),
  suggestedCategory: varchar({ length: 50 }),
  priority: varchar({ length: 20 }).default('low'),
  status: varchar({ length: 20 }).default('open'),
  resolvedAt: timestamp({ mode: 'string' }),
  notes: text(),
}, (table) => [
  index("idx_gaps_occurrences").on(table.occurrences),
  index("idx_gaps_priority").on(table.priority),
  index("idx_gaps_status").on(table.status),
]);

export const conversionEvents = mysqlTable("conversion_events", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  sessionId: varchar({ length: 64 }),
  eventType: varchar({ length: 50 }).notNull(),
  fromTier: varchar({ length: 20 }),
  toTier: varchar({ length: 20 }),
  plan: varchar({ length: 20 }),
  promptLocation: varchar({ length: 100 }),
  triggerFeature: varchar({ length: 100 }),
  amount: decimal({ precision: 10, scale: 2 }),
  currency: varchar({ length: 3 }).default('USD'),
  stripeSessionId: varchar({ length: 255 }),
  completed: tinyint().default(0),
  completedAt: timestamp({ mode: 'string' }),
  timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_conversion_user").on(table.userId),
  index("idx_conversion_event_type").on(table.eventType),
  index("idx_conversion_timestamp").on(table.timestamp),
]);

export const featureUsageStats = mysqlTable("feature_usage_stats", {
  id: int().autoincrement().primaryKey().notNull(),
  date: date({ mode: 'string' }).notNull(),
  featureName: varchar({ length: 100 }).notNull(),
  uniqueUsers: int().default(0),
  totalUsage: int().default(0),
  avgUsagePerUser: decimal({ precision: 10, scale: 2 }),
  tierBreakdown: json(),
  deviceBreakdown: json(),
}, (table) => [
  index("idx_usage_feature").on(table.featureName),
  unique("unique_feature_date").on(table.date, table.featureName),
]);

// =============================================================================
// TYPE EXPORTS - Re-export from shared-types for convenience
// =============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type County = typeof counties.$inferSelect;
export type InsertCounty = typeof counties.$inferInsert;

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

export type Query = typeof queries.$inferSelect;
export type InsertQuery = typeof queries.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export type ProtocolChunk = typeof protocolChunks.$inferSelect;
export type InsertProtocolChunk = typeof protocolChunks.$inferInsert;

export type ProtocolVersion = typeof protocolVersions.$inferSelect;
export type InsertProtocolVersion = typeof protocolVersions.$inferInsert;

export type ProtocolUpload = typeof protocolUploads.$inferSelect;
export type InsertProtocolUpload = typeof protocolUploads.$inferInsert;

export type AgencyMember = typeof agencyMembers.$inferSelect;
export type InsertAgencyMember = typeof agencyMembers.$inferInsert;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = typeof integrationLogs.$inferInsert;

export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type InsertStripeWebhookEvent = typeof stripeWebhookEvents.$inferInsert;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;

export type UserCounty = typeof userCounties.$inferSelect;
export type InsertUserCounty = typeof userCounties.$inferInsert;

export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = typeof pushTokens.$inferInsert;

export type DripEmailSent = typeof dripEmailsSent.$inferSelect;
export type InsertDripEmailSent = typeof dripEmailsSent.$inferInsert;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type SearchAnalytics = typeof searchAnalytics.$inferSelect;
export type InsertSearchAnalytics = typeof searchAnalytics.$inferInsert;

export type ProtocolAccessLog = typeof protocolAccessLogs.$inferSelect;
export type InsertProtocolAccessLog = typeof protocolAccessLogs.$inferInsert;

export type SessionAnalytics = typeof sessionAnalytics.$inferSelect;
export type InsertSessionAnalytics = typeof sessionAnalytics.$inferInsert;

export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetric = typeof dailyMetrics.$inferInsert;

export type RetentionCohort = typeof retentionCohorts.$inferSelect;
export type InsertRetentionCohort = typeof retentionCohorts.$inferInsert;

export type ContentGap = typeof contentGaps.$inferSelect;
export type InsertContentGap = typeof contentGaps.$inferInsert;

export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = typeof conversionEvents.$inferInsert;

export type FeatureUsageStat = typeof featureUsageStats.$inferSelect;
export type InsertFeatureUsageStat = typeof featureUsageStats.$inferInsert;

// Re-export shared types
export type {
  AuditAction,
  ContactStatus,
  FeedbackCategory,
  FeedbackStatus,
  IntegrationPartner,
  UserRole,
  UserTier,
  AgencyType,
  SubscriptionTier,
  MemberRole,
  MemberStatus,
  ProtocolStatus,
  UploadStatus,
  AccessLevel,
  EventType,
  SearchMethod,
  AccessSource,
  QueryCategory,
} from "./shared-types";
