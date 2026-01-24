/**
 * Drizzle ORM Relations for Protocol Guide
 *
 * Defines relationships between tables for type-safe joins and queries.
 * These relations work with the PostgreSQL schema (primary database).
 *
 * @see /drizzle/schema.ts - Table definitions
 */

import { relations } from "drizzle-orm";
import {
  users,
  counties,
  agencies,
  agencyMembers,
  bookmarks,
  feedback,
  queries,
  auditLogs,
  userAuthProviders,
  userCounties,
  userStates,
  userAgencies,
  searchHistory,
  protocolChunks,
  protocolVersions,
  protocolUploads,
  contactSubmissions,
  integrationLogs,
  stripeWebhookEvents,
  pushTokens,
  dripEmailsSent,
} from "./schema";

import {
  analyticsEvents,
  searchAnalytics,
  protocolAccessLogs,
  sessionAnalytics,
  conversionEvents,
} from "./analytics-schema";

// =============================================================================
// USER RELATIONS
// =============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  // User has one selected county
  selectedCounty: one(counties, {
    fields: [users.selectedCountyId],
    references: [counties.id],
    relationName: "userSelectedCounty",
  }),

  // User has one home county
  homeCounty: one(counties, {
    fields: [users.homeCountyId],
    references: [counties.id],
    relationName: "userHomeCounty",
  }),

  // User has many bookmarks
  bookmarks: many(bookmarks),

  // User has many feedback entries
  feedbackEntries: many(feedback),

  // User has many queries
  queryHistory: many(queries),

  // User has many audit log entries
  auditLogs: many(auditLogs),

  // User has many auth providers (OAuth)
  authProviders: many(userAuthProviders),

  // User has many county subscriptions
  userCounties: many(userCounties),

  // User has many state subscriptions
  userStates: many(userStates),

  // User has many agency memberships
  userAgencies: many(userAgencies),

  // User has many search history entries
  searchHistoryEntries: many(searchHistory),

  // User has many push tokens
  pushTokens: many(pushTokens),

  // User has many drip emails sent
  dripEmailsSent: many(dripEmailsSent),

  // User has many agency memberships
  agencyMemberships: many(agencyMembers),

  // Analytics relations
  analyticsEvents: many(analyticsEvents),
  searchAnalytics: many(searchAnalytics),
  protocolAccessLogs: many(protocolAccessLogs),
  sessionAnalytics: many(sessionAnalytics),
  conversionEvents: many(conversionEvents),
}));

// =============================================================================
// COUNTY RELATIONS
// =============================================================================

export const countiesRelations = relations(counties, ({ many }) => ({
  // County has many protocol chunks
  protocolChunks: many(protocolChunks),

  // County has many queries
  queries: many(queries),

  // County has many feedback entries
  feedback: many(feedback),

  // County has many user subscriptions
  userCounties: many(userCounties),

  // County has many search history entries
  searchHistory: many(searchHistory),
}));

// =============================================================================
// AGENCY RELATIONS
// =============================================================================

export const agenciesRelations = relations(agencies, ({ many }) => ({
  // Agency has many members
  members: many(agencyMembers),

  // Agency has many protocol versions
  protocolVersions: many(protocolVersions),

  // Agency has many protocol uploads
  protocolUploads: many(protocolUploads),

  // Agency has many user subscriptions
  userAgencies: many(userAgencies),

  // Agency has many bookmarks
  bookmarks: many(bookmarks),
}));

// =============================================================================
// AGENCY MEMBER RELATIONS
// =============================================================================

export const agencyMembersRelations = relations(agencyMembers, ({ one }) => ({
  // Member belongs to agency
  agency: one(agencies, {
    fields: [agencyMembers.agencyId],
    references: [agencies.id],
  }),

  // Member is a user
  user: one(users, {
    fields: [agencyMembers.userId],
    references: [users.id],
  }),

  // Member was invited by another user
  inviter: one(users, {
    fields: [agencyMembers.invitedBy],
    references: [users.id],
    relationName: "memberInviter",
  }),
}));

// =============================================================================
// BOOKMARK RELATIONS
// =============================================================================

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  // Bookmark belongs to user
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),

  // Bookmark optionally belongs to agency
  agency: one(agencies, {
    fields: [bookmarks.agencyId],
    references: [agencies.id],
  }),
}));

// =============================================================================
// FEEDBACK RELATIONS
// =============================================================================

export const feedbackRelations = relations(feedback, ({ one }) => ({
  // Feedback belongs to user
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),

  // Feedback optionally belongs to county
  county: one(counties, {
    fields: [feedback.countyId],
    references: [counties.id],
  }),
}));

// =============================================================================
// QUERY RELATIONS
// =============================================================================

export const queriesRelations = relations(queries, ({ one }) => ({
  // Query belongs to user
  user: one(users, {
    fields: [queries.userId],
    references: [users.id],
  }),

  // Query belongs to county
  county: one(counties, {
    fields: [queries.countyId],
    references: [counties.id],
  }),
}));

// =============================================================================
// AUDIT LOG RELATIONS
// =============================================================================

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  // Audit log optionally belongs to user
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// USER AUTH PROVIDER RELATIONS
// =============================================================================

export const userAuthProvidersRelations = relations(userAuthProviders, ({ one }) => ({
  // Auth provider belongs to user
  user: one(users, {
    fields: [userAuthProviders.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// USER COUNTY RELATIONS
// =============================================================================

export const userCountiesRelations = relations(userCounties, ({ one }) => ({
  // User county belongs to user
  user: one(users, {
    fields: [userCounties.userId],
    references: [users.id],
  }),

  // User county belongs to county
  county: one(counties, {
    fields: [userCounties.countyId],
    references: [counties.id],
  }),
}));

// =============================================================================
// USER STATES RELATIONS
// =============================================================================

export const userStatesRelations = relations(userStates, ({ one }) => ({
  // User state belongs to user
  user: one(users, {
    fields: [userStates.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// USER AGENCIES RELATIONS
// =============================================================================

export const userAgenciesRelations = relations(userAgencies, ({ one }) => ({
  // User agency belongs to user
  user: one(users, {
    fields: [userAgencies.userId],
    references: [users.id],
  }),

  // User agency belongs to agency
  agency: one(agencies, {
    fields: [userAgencies.agencyId],
    references: [agencies.id],
  }),
}));

// =============================================================================
// SEARCH HISTORY RELATIONS
// =============================================================================

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  // Search history belongs to user
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),

  // Search history optionally belongs to county
  county: one(counties, {
    fields: [searchHistory.countyId],
    references: [counties.id],
  }),
}));

// =============================================================================
// PROTOCOL CHUNK RELATIONS
// =============================================================================

export const protocolChunksRelations = relations(protocolChunks, ({ one, many }) => ({
  // Protocol chunk belongs to county
  county: one(counties, {
    fields: [protocolChunks.countyId],
    references: [counties.id],
  }),

  // Protocol chunk has many access logs
  accessLogs: many(protocolAccessLogs),
}));

// =============================================================================
// PROTOCOL VERSION RELATIONS
// =============================================================================

export const protocolVersionsRelations = relations(protocolVersions, ({ one }) => ({
  // Protocol version belongs to agency
  agency: one(agencies, {
    fields: [protocolVersions.agencyId],
    references: [agencies.id],
  }),

  // Protocol version was created by a user
  creator: one(users, {
    fields: [protocolVersions.createdBy],
    references: [users.id],
    relationName: "versionCreator",
  }),

  // Protocol version was approved by a user
  approver: one(users, {
    fields: [protocolVersions.approvedBy],
    references: [users.id],
    relationName: "versionApprover",
  }),

  // Protocol version was published by a user
  publisher: one(users, {
    fields: [protocolVersions.publishedBy],
    references: [users.id],
    relationName: "versionPublisher",
  }),
}));

// =============================================================================
// PROTOCOL UPLOAD RELATIONS
// =============================================================================

export const protocolUploadsRelations = relations(protocolUploads, ({ one }) => ({
  // Protocol upload belongs to agency
  agency: one(agencies, {
    fields: [protocolUploads.agencyId],
    references: [agencies.id],
  }),

  // Protocol upload was created by user
  uploader: one(users, {
    fields: [protocolUploads.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// PUSH TOKEN RELATIONS
// =============================================================================

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  // Push token belongs to user
  user: one(users, {
    fields: [pushTokens.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// DRIP EMAILS SENT RELATIONS
// =============================================================================

export const dripEmailsSentRelations = relations(dripEmailsSent, ({ one }) => ({
  // Drip email sent belongs to user
  user: one(users, {
    fields: [dripEmailsSent.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// ANALYTICS RELATIONS
// =============================================================================

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  // Analytics event optionally belongs to user
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));

export const searchAnalyticsRelations = relations(searchAnalytics, ({ one }) => ({
  // Search analytics optionally belongs to user
  user: one(users, {
    fields: [searchAnalytics.userId],
    references: [users.id],
  }),

  // Search analytics optionally belongs to agency
  agency: one(agencies, {
    fields: [searchAnalytics.agencyId],
    references: [agencies.id],
  }),

  // Top result protocol
  topResultProtocol: one(protocolChunks, {
    fields: [searchAnalytics.topResultProtocolId],
    references: [protocolChunks.id],
    relationName: "topResult",
  }),

  // Selected protocol
  selectedProtocol: one(protocolChunks, {
    fields: [searchAnalytics.selectedProtocolId],
    references: [protocolChunks.id],
    relationName: "selectedResult",
  }),
}));

export const protocolAccessLogsRelations = relations(protocolAccessLogs, ({ one }) => ({
  // Access log optionally belongs to user
  user: one(users, {
    fields: [protocolAccessLogs.userId],
    references: [users.id],
  }),

  // Access log belongs to protocol chunk
  protocolChunk: one(protocolChunks, {
    fields: [protocolAccessLogs.protocolChunkId],
    references: [protocolChunks.id],
  }),

  // Access log optionally belongs to agency
  agency: one(agencies, {
    fields: [protocolAccessLogs.agencyId],
    references: [agencies.id],
  }),
}));

export const sessionAnalyticsRelations = relations(sessionAnalytics, ({ one }) => ({
  // Session analytics optionally belongs to user
  user: one(users, {
    fields: [sessionAnalytics.userId],
    references: [users.id],
  }),
}));

export const conversionEventsRelations = relations(conversionEvents, ({ one }) => ({
  // Conversion event belongs to user
  user: one(users, {
    fields: [conversionEvents.userId],
    references: [users.id],
  }),
}));
