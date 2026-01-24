/**
 * Analytics Schema for Protocol Guide (PostgreSQL)
 *
 * Tracks user behavior, search patterns, protocol usage, and retention metrics.
 * Designed for EMS professional behavior analysis and product improvement.
 */

import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  real,
  date,
  numeric,
  uniqueIndex,
  index,
  serial,
} from "drizzle-orm/pg-core";

// ============ Analytics Events Table ============

/**
 * Generic analytics events table for flexible event tracking.
 * Supports custom properties for different event types.
 */
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"), // NULL for anonymous events
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    eventType: varchar("event_type", { length: 50 }).notNull(), // 'search', 'protocol', 'user', 'conversion'
    eventName: varchar("event_name", { length: 100 }).notNull(), // Specific event name
    properties: json("properties").$type<Record<string, unknown>>(),
    deviceType: varchar("device_type", { length: 20 }), // 'ios', 'android', 'web', 'pwa'
    appVersion: varchar("app_version", { length: 20 }),
    osVersion: varchar("os_version", { length: 20 }),
    screenName: varchar("screen_name", { length: 100 }),
    referrer: varchar("referrer", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("idx_event_type").on(table.eventType),
    index("idx_user_id").on(table.userId),
    index("idx_timestamp").on(table.timestamp),
    index("idx_session").on(table.sessionId),
  ]
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// ============ Search Analytics Table ============

/**
 * Detailed search analytics for understanding search behavior.
 * Tracks query patterns, result quality, and search performance.
 */
export const searchAnalytics = pgTable(
  "search_analytics",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    queryText: varchar("query_text", { length: 500 }).notNull(),
    queryTokenCount: integer("query_token_count"), // For query complexity analysis
    stateFilter: varchar("state_filter", { length: 2 }),
    agencyId: integer("agency_id"),
    resultsCount: integer("results_count").notNull(),
    topResultProtocolId: integer("top_result_protocol_id"),
    topResultScore: real("top_result_score"),
    selectedResultRank: integer("selected_result_rank"), // Which result user clicked (1-indexed)
    selectedProtocolId: integer("selected_protocol_id"),
    timeToFirstResult: integer("time_to_first_result"), // Milliseconds
    totalSearchTime: integer("total_search_time"), // Milliseconds
    searchMethod: varchar("search_method", { length: 20 }), // 'text', 'voice', 'example_click'
    isVoiceQuery: boolean("is_voice_query").default(false),
    voiceTranscriptionTime: integer("voice_transcription_time"), // Ms for voice to text
    noResultsFound: boolean("no_results_found").default(false),
    queryCategory: varchar("query_category", { length: 50 }), // Auto-classified category
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("idx_user_search").on(table.userId, table.timestamp),
    index("idx_no_results").on(table.noResultsFound, table.timestamp),
    index("idx_state").on(table.stateFilter),
    index("idx_category").on(table.queryCategory),
  ]
);

export type SearchAnalytics = typeof searchAnalytics.$inferSelect;
export type InsertSearchAnalytics = typeof searchAnalytics.$inferInsert;

// ============ Protocol Access Logs Table ============

/**
 * Protocol viewing analytics for content popularity and engagement.
 */
export const protocolAccessLogs = pgTable(
  "protocol_access_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    sessionId: varchar("session_id", { length: 64 }),
    protocolChunkId: integer("protocol_chunk_id").notNull(),
    protocolNumber: varchar("protocol_number", { length: 50 }),
    protocolTitle: varchar("protocol_title", { length: 255 }),
    agencyId: integer("agency_id"),
    stateCode: varchar("state_code", { length: 2 }),
    accessSource: varchar("access_source", { length: 50 }), // 'search', 'history', 'bookmark', 'deep_link'
    timeSpentSeconds: integer("time_spent_seconds"), // How long user viewed protocol
    scrollDepth: real("scroll_depth"), // 0-1, how far user scrolled
    copiedContent: boolean("copied_content").default(false),
    sharedProtocol: boolean("shared_protocol").default(false),
    fromSearchQuery: varchar("from_search_query", { length: 500 }), // Original search that led here
    searchResultRank: integer("search_result_rank"), // Position in search results
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("idx_protocol").on(table.protocolChunkId),
    index("idx_user_access").on(table.userId, table.timestamp),
    index("idx_state_analytics").on(table.stateCode),
    index("idx_source").on(table.accessSource),
  ]
);

export type ProtocolAccessLog = typeof protocolAccessLogs.$inferSelect;
export type InsertProtocolAccessLog = typeof protocolAccessLogs.$inferInsert;

// ============ Session Analytics Table ============

/**
 * Session-level analytics for understanding usage patterns.
 */
export const sessionAnalytics = pgTable(
  "session_analytics",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
    deviceType: varchar("device_type", { length: 20 }),
    appVersion: varchar("app_version", { length: 20 }),
    platform: varchar("platform", { length: 20 }), // 'ios', 'android', 'web'
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    durationSeconds: integer("duration_seconds"),
    searchCount: integer("search_count").default(0),
    protocolsViewed: integer("protocols_viewed").default(0),
    queriesSubmitted: integer("queries_submitted").default(0), // AI-powered queries
    screenTransitions: integer("screen_transitions").default(0),
    isNewUser: boolean("is_new_user").default(false),
    userTier: varchar("user_tier", { length: 20 }),
    referralSource: varchar("referral_source", { length: 100 }),
    entryScreen: varchar("entry_screen", { length: 100 }),
    exitScreen: varchar("exit_screen", { length: 100 }),
    userCertificationLevel: varchar("user_certification_level", { length: 50 }), // EMT, AEMT, Paramedic
  },
  (table) => [
    index("idx_user_session").on(table.userId),
    index("idx_start").on(table.startTime),
  ]
);

export type SessionAnalytics = typeof sessionAnalytics.$inferSelect;
export type InsertSessionAnalytics = typeof sessionAnalytics.$inferInsert;

// ============ Daily Metrics Table ============

/**
 * Pre-aggregated daily metrics for dashboard performance.
 */
export const dailyMetrics = pgTable(
  "daily_metrics",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    metricType: varchar("metric_type", { length: 50 }).notNull(), // 'dau', 'searches', 'conversions', etc.
    dimension: varchar("dimension", { length: 100 }), // State, tier, device, etc.
    dimensionValue: varchar("dimension_value", { length: 100 }),
    count: integer("count").default(0),
    sumValue: numeric("sum_value", { precision: 15, scale: 2 }),
    avgValue: numeric("avg_value", { precision: 15, scale: 4 }),
    p50Value: numeric("p50_value", { precision: 15, scale: 4 }),
    p95Value: numeric("p95_value", { precision: 15, scale: 4 }),
    minValue: numeric("min_value", { precision: 15, scale: 4 }),
    maxValue: numeric("max_value", { precision: 15, scale: 4 }),
  },
  (table) => [
    uniqueIndex("unique_daily").on(
      table.date,
      table.metricType,
      table.dimension,
      table.dimensionValue
    ),
    index("idx_date").on(table.date),
    index("idx_metric").on(table.metricType),
  ]
);

export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetric = typeof dailyMetrics.$inferInsert;

// ============ User Retention Cohorts Table ============

/**
 * Pre-calculated retention cohort data for retention analysis.
 */
export const retentionCohorts = pgTable(
  "retention_cohorts",
  {
    id: serial("id").primaryKey(),
    cohortDate: date("cohort_date").notNull(), // Week/month of user signup
    cohortType: varchar("cohort_type", { length: 20 }).notNull(), // 'weekly', 'monthly'
    cohortSize: integer("cohort_size").notNull(),
    d1Retained: integer("d1_retained"),
    d7Retained: integer("d7_retained"),
    d14Retained: integer("d14_retained"),
    d30Retained: integer("d30_retained"),
    d60Retained: integer("d60_retained"),
    d90Retained: integer("d90_retained"),
    segment: varchar("segment", { length: 50 }), // 'free', 'pro', 'enterprise', 'all'
    acquisitionSource: varchar("acquisition_source", { length: 100 }),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_cohort").on(
      table.cohortDate,
      table.cohortType,
      table.segment
    ),
    index("idx_cohort_date").on(table.cohortDate),
  ]
);

export type RetentionCohort = typeof retentionCohorts.$inferSelect;
export type InsertRetentionCohort = typeof retentionCohorts.$inferInsert;

// ============ Content Gap Analysis Table ============

/**
 * Tracks zero-result searches for content gap identification.
 */
export const contentGaps = pgTable(
  "content_gaps",
  {
    id: serial("id").primaryKey(),
    queryPattern: varchar("query_pattern", { length: 500 }).notNull(), // Normalized query
    occurrences: integer("occurrences").default(1),
    lastOccurred: timestamp("last_occurred").defaultNow().notNull(),
    firstOccurred: timestamp("first_occurred").defaultNow().notNull(),
    statesRequested: json("states_requested").$type<string[]>(), // Which states users filtered by
    suggestedCategory: varchar("suggested_category", { length: 50 }),
    priority: varchar("priority", { length: 20 }).default("low"), // 'high', 'medium', 'low'
    status: varchar("status", { length: 20 }).default("open"), // 'open', 'in_progress', 'resolved', 'wont_fix'
    resolvedAt: timestamp("resolved_at"),
    notes: text("notes"),
  },
  (table) => [
    index("idx_occurrences").on(table.occurrences),
    index("idx_priority").on(table.priority),
    index("idx_status").on(table.status),
  ]
);

export type ContentGap = typeof contentGaps.$inferSelect;
export type InsertContentGap = typeof contentGaps.$inferInsert;

// ============ Conversion Events Table ============

/**
 * Tracks conversion funnel events for revenue analysis.
 */
export const conversionEvents = pgTable(
  "conversion_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    sessionId: varchar("session_id", { length: 64 }),
    eventType: varchar("event_type", { length: 50 }).notNull(), // 'upgrade_prompt_shown', 'checkout_started', 'subscription_completed'
    fromTier: varchar("from_tier", { length: 20 }),
    toTier: varchar("to_tier", { length: 20 }),
    plan: varchar("plan", { length: 20 }), // 'monthly', 'annual'
    promptLocation: varchar("prompt_location", { length: 100 }), // Where the upgrade prompt was shown
    triggerFeature: varchar("trigger_feature", { length: 100 }), // Feature that triggered upgrade
    amount: numeric("amount", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    stripeSessionId: varchar("stripe_session_id", { length: 255 }),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("idx_user_conversion").on(table.userId),
    index("idx_event_type_conversion").on(table.eventType),
    index("idx_timestamp_conversion").on(table.timestamp),
  ]
);

export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = typeof conversionEvents.$inferInsert;

// ============ Feature Usage Stats Table ============

/**
 * Aggregated feature usage statistics.
 */
export const featureUsageStats = pgTable(
  "feature_usage_stats",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    featureName: varchar("feature_name", { length: 100 }).notNull(),
    uniqueUsers: integer("unique_users").default(0),
    totalUsage: integer("total_usage").default(0),
    avgUsagePerUser: numeric("avg_usage_per_user", { precision: 10, scale: 2 }),
    tierBreakdown: json("tier_breakdown").$type<Record<string, number>>(), // { free: 100, pro: 50 }
    deviceBreakdown: json("device_breakdown").$type<Record<string, number>>(), // { ios: 80, android: 40, web: 30 }
  },
  (table) => [
    uniqueIndex("unique_feature_date").on(table.date, table.featureName),
    index("idx_feature").on(table.featureName),
  ]
);

export type FeatureUsageStat = typeof featureUsageStats.$inferSelect;
export type InsertFeatureUsageStat = typeof featureUsageStats.$inferInsert;

// ============ Type Exports ============

export type EventType = "search" | "protocol" | "user" | "conversion" | "feature" | "error";

export type SearchMethod = "text" | "voice" | "example_click";

export type AccessSource = "search" | "history" | "bookmark" | "deep_link" | "integration";

export type QueryCategory =
  | "cardiac"
  | "respiratory"
  | "trauma"
  | "pediatric"
  | "ob_gyn"
  | "behavioral"
  | "medical"
  | "medication"
  | "procedure"
  | "other";
