/**
 * Agency Admin Analytics Router
 * Provides detailed analytics data for agency administrators
 *
 * Features:
 * - Search query analytics over time
 * - Protocol usage metrics
 * - User activity tracking
 * - Error rate monitoring
 * - Export functionality
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../_core/trpc";
import { sql, eq, desc, and, gte, lte, count, avg, sum } from "drizzle-orm";
import { getDb } from "../../db/connection";
import {
  searchHistory,
  queries,
  users,
  protocolVersions,
  agencyMembers,
  protocolChunks,
  feedback,
} from "../../../drizzle/schema";
import {
  searchAnalytics,
  protocolAccessLogs,
  sessionAnalytics,
  dailyMetrics,
} from "../../../drizzle/analytics-schema";

// Helper to get date N days ago
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Format date as YYYY-MM-DD
function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export const analyticsProcedures = {
  /**
   * Get search analytics for the agency
   * Returns query counts over time, popular queries, and search performance
   */
  getSearchAnalytics: protectedProcedure
    .input(
      z.object({
        agencyId: z.number(),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const startDate = daysAgo(input.days);
      const endDate = new Date();

      // Try to get from search_analytics table first
      let searchData: {
        date: string;
        count: number;
        avgTime: number;
        noResults: number;
      }[] = [];

      try {
        const results = await db
          .select({
            date: sql<string>`DATE(${searchAnalytics.timestamp})`,
            count: count(),
            avgTime: avg(searchAnalytics.totalSearchTime),
            noResults: sql<number>`SUM(CASE WHEN ${searchAnalytics.noResultsFound} THEN 1 ELSE 0 END)`,
          })
          .from(searchAnalytics)
          .where(
            and(
              eq(searchAnalytics.agencyId, input.agencyId),
              gte(searchAnalytics.timestamp, startDate)
            )
          )
          .groupBy(sql`DATE(${searchAnalytics.timestamp})`)
          .orderBy(sql`DATE(${searchAnalytics.timestamp})`);

        searchData = results.map((r) => ({
          date: String(r.date),
          count: Number(r.count),
          avgTime: Number(r.avgTime || 0),
          noResults: Number(r.noResults || 0),
        }));
      } catch {
        // Fallback to search_history if analytics table doesn't exist
        const results = await db
          .select({
            date: sql<string>`DATE(${searchHistory.createdAt})`,
            count: count(),
          })
          .from(searchHistory)
          .where(gte(searchHistory.createdAt, startDate.toISOString()))
          .groupBy(sql`DATE(${searchHistory.createdAt})`)
          .orderBy(sql`DATE(${searchHistory.createdAt})`);

        searchData = results.map((r) => ({
          date: String(r.date),
          count: Number(r.count),
          avgTime: 0,
          noResults: 0,
        }));
      }

      // Fill in missing dates with zeros
      const filledData: typeof searchData = [];
      const dateMap = new Map(searchData.map((d) => [d.date, d]));
      for (let i = input.days; i >= 0; i--) {
        const date = formatDate(daysAgo(i));
        filledData.push(
          dateMap.get(date) || { date, count: 0, avgTime: 0, noResults: 0 }
        );
      }

      // Get top search queries
      let topQueries: { query: string; count: number }[] = [];
      try {
        const queryResults = await db
          .select({
            query: searchAnalytics.queryText,
            count: count(),
          })
          .from(searchAnalytics)
          .where(
            and(
              eq(searchAnalytics.agencyId, input.agencyId),
              gte(searchAnalytics.timestamp, startDate)
            )
          )
          .groupBy(searchAnalytics.queryText)
          .orderBy(desc(count()))
          .limit(10);

        topQueries = queryResults.map((q) => ({
          query: q.query,
          count: Number(q.count),
        }));
      } catch {
        // Fallback
        const queryResults = await db
          .select({
            query: searchHistory.searchQuery,
            count: count(),
          })
          .from(searchHistory)
          .where(gte(searchHistory.createdAt, startDate.toISOString()))
          .groupBy(searchHistory.searchQuery)
          .orderBy(desc(count()))
          .limit(10);

        topQueries = queryResults.map((q) => ({
          query: q.query,
          count: Number(q.count),
        }));
      }

      // Calculate summary stats
      const totalSearches = filledData.reduce((sum, d) => sum + d.count, 0);
      const avgSearchesPerDay = totalSearches / (input.days || 1);
      const totalNoResults = filledData.reduce((sum, d) => sum + d.noResults, 0);
      const noResultsRate = totalSearches > 0 ? (totalNoResults / totalSearches) * 100 : 0;

      return {
        timeSeries: filledData,
        topQueries,
        summary: {
          totalSearches,
          avgSearchesPerDay: Math.round(avgSearchesPerDay * 10) / 10,
          noResultsRate: Math.round(noResultsRate * 10) / 10,
          avgResponseTime: filledData.reduce((sum, d) => sum + d.avgTime, 0) / filledData.length || 0,
        },
      };
    }),

  /**
   * Get protocol usage analytics
   * Returns most viewed protocols, freshness metrics, and missing protocol alerts
   */
  getProtocolAnalytics: protectedProcedure
    .input(
      z.object({
        agencyId: z.number(),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const startDate = daysAgo(input.days);

      // Get all protocols for this agency
      const protocols = await db
        .select()
        .from(protocolVersions)
        .where(eq(protocolVersions.agencyId, input.agencyId))
        .orderBy(desc(protocolVersions.updatedAt));

      // Get protocol access counts if available
      let protocolViews: { protocolNumber: string; views: number }[] = [];
      try {
        const viewResults = await db
          .select({
            protocolNumber: protocolAccessLogs.protocolNumber,
            views: count(),
          })
          .from(protocolAccessLogs)
          .where(
            and(
              eq(protocolAccessLogs.agencyId, input.agencyId),
              gte(protocolAccessLogs.timestamp, startDate)
            )
          )
          .groupBy(protocolAccessLogs.protocolNumber)
          .orderBy(desc(count()))
          .limit(20);

        protocolViews = viewResults.map((p) => ({
          protocolNumber: p.protocolNumber || "Unknown",
          views: Number(p.views),
        }));
      } catch {
        // Table might not exist yet
      }

      // Calculate freshness metrics
      const now = new Date();
      const oneMonthAgo = daysAgo(30);
      const threeMonthsAgo = daysAgo(90);
      const sixMonthsAgo = daysAgo(180);
      const oneYearAgo = daysAgo(365);

      const freshness = {
        updatedLastMonth: protocols.filter(
          (p) => p.updatedAt && new Date(p.updatedAt) > oneMonthAgo
        ).length,
        updatedLast3Months: protocols.filter(
          (p) => p.updatedAt && new Date(p.updatedAt) > threeMonthsAgo
        ).length,
        updatedLast6Months: protocols.filter(
          (p) => p.updatedAt && new Date(p.updatedAt) > sixMonthsAgo
        ).length,
        staleOver1Year: protocols.filter(
          (p) => p.updatedAt && new Date(p.updatedAt) < oneYearAgo
        ).length,
      };

      // Get protocols by status
      const statusCounts = {
        draft: protocols.filter((p) => p.status === "draft").length,
        review: protocols.filter((p) => p.status === "review").length,
        approved: protocols.filter((p) => p.status === "approved").length,
        published: protocols.filter((p) => p.status === "published").length,
        archived: protocols.filter((p) => p.status === "archived").length,
      };

      // Find stale protocols (not updated in over a year)
      const staleProtocols = protocols
        .filter((p) => p.updatedAt && new Date(p.updatedAt) < oneYearAgo)
        .slice(0, 10)
        .map((p) => ({
          id: p.id,
          protocolNumber: p.protocolNumber,
          title: p.title,
          lastUpdated: p.updatedAt,
          daysSinceUpdate: Math.floor(
            (now.getTime() - new Date(p.updatedAt!).getTime()) / (1000 * 60 * 60 * 24)
          ),
        }));

      return {
        totalProtocols: protocols.length,
        statusCounts,
        freshness,
        staleProtocols,
        mostViewed: protocolViews,
        recentlyUpdated: protocols.slice(0, 5).map((p) => ({
          id: p.id,
          protocolNumber: p.protocolNumber,
          title: p.title,
          status: p.status,
          updatedAt: p.updatedAt,
        })),
      };
    }),

  /**
   * Get user activity analytics
   * Returns active users, usage per user, and activity trends
   */
  getUserAnalytics: protectedProcedure
    .input(
      z.object({
        agencyId: z.number(),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const startDate = daysAgo(input.days);

      // Get agency members with user details
      const members = await db
        .select({
          member: agencyMembers,
          user: users,
        })
        .from(agencyMembers)
        .leftJoin(users, eq(agencyMembers.userId, users.id))
        .where(eq(agencyMembers.agencyId, input.agencyId));

      // Get user activity counts from search history
      const userActivity: { userId: number; searches: number; lastActive: string | null }[] = [];
      for (const member of members) {
        if (!member.user) continue;

        const activityResult = await db
          .select({
            count: count(),
            lastActive: sql<string>`MAX(${searchHistory.createdAt})`,
          })
          .from(searchHistory)
          .where(
            and(
              eq(searchHistory.userId, member.user.id),
              gte(searchHistory.createdAt, startDate.toISOString())
            )
          );

        userActivity.push({
          userId: member.user.id,
          searches: Number(activityResult[0]?.count || 0),
          lastActive: activityResult[0]?.lastActive || null,
        });
      }

      // Build user list with activity
      const userList = members
        .filter((m) => m.user)
        .map((m) => {
          const activity = userActivity.find((a) => a.userId === m.user!.id);
          return {
            id: m.user!.id,
            name: m.user!.name || "Unnamed",
            email: m.user!.email || "",
            role: m.member.role,
            status: m.member.status,
            tier: m.user!.tier,
            searches: activity?.searches || 0,
            lastActive: activity?.lastActive || m.user!.lastSignedIn,
            joinedAt: m.member.acceptedAt || m.member.createdAt,
          };
        })
        .sort((a, b) => b.searches - a.searches);

      // Calculate activity metrics
      const activeUsers = userList.filter((u) => u.searches > 0).length;
      const totalSearches = userList.reduce((sum, u) => sum + u.searches, 0);

      // Get daily active users trend
      let dauTrend: { date: string; count: number }[] = [];
      try {
        const dauResults = await db
          .select({
            date: sql<string>`DATE(${sessionAnalytics.startTime})`,
            count: sql<number>`COUNT(DISTINCT ${sessionAnalytics.userId})`,
          })
          .from(sessionAnalytics)
          .where(gte(sessionAnalytics.startTime, startDate))
          .groupBy(sql`DATE(${sessionAnalytics.startTime})`)
          .orderBy(sql`DATE(${sessionAnalytics.startTime})`);

        dauTrend = dauResults.map((r) => ({
          date: String(r.date),
          count: Number(r.count),
        }));
      } catch {
        // Table might not exist
      }

      // Fill missing dates
      const filledDau: typeof dauTrend = [];
      const dauMap = new Map(dauTrend.map((d) => [d.date, d.count]));
      for (let i = input.days; i >= 0; i--) {
        const date = formatDate(daysAgo(i));
        filledDau.push({ date, count: dauMap.get(date) || 0 });
      }

      return {
        totalMembers: members.length,
        activeMembers: activeUsers,
        totalSearches,
        avgSearchesPerUser: activeUsers > 0 ? Math.round((totalSearches / activeUsers) * 10) / 10 : 0,
        users: userList,
        dauTrend: filledDau,
        byRole: {
          owner: members.filter((m) => m.member.role === "owner").length,
          admin: members.filter((m) => m.member.role === "admin").length,
          protocol_author: members.filter((m) => m.member.role === "protocol_author").length,
          member: members.filter((m) => m.member.role === "member").length,
        },
      };
    }),

  /**
   * Get error and feedback analytics
   */
  getErrorAnalytics: protectedProcedure
    .input(
      z.object({
        agencyId: z.number(),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const startDate = daysAgo(input.days);

      // Get feedback/error reports
      const feedbackResults = await db
        .select()
        .from(feedback)
        .where(gte(feedback.createdAt, startDate.toISOString()))
        .orderBy(desc(feedback.createdAt))
        .limit(50);

      // Calculate stats
      const totalFeedback = feedbackResults.length;
      const errorReports = feedbackResults.filter((f) => f.category === "error").length;
      const suggestions = feedbackResults.filter((f) => f.category === "suggestion").length;
      const pendingCount = feedbackResults.filter((f) => f.status === "pending").length;
      const resolvedCount = feedbackResults.filter((f) => f.status === "resolved").length;

      // Group by day
      const feedbackByDay = feedbackResults.reduce((acc, f) => {
        const date = f.createdAt?.split("T")[0] || "";
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dailyFeedback: { date: string; count: number }[] = [];
      for (let i = input.days; i >= 0; i--) {
        const date = formatDate(daysAgo(i));
        dailyFeedback.push({ date, count: feedbackByDay[date] || 0 });
      }

      return {
        summary: {
          total: totalFeedback,
          errors: errorReports,
          suggestions,
          pending: pendingCount,
          resolved: resolvedCount,
          resolutionRate: totalFeedback > 0 ? Math.round((resolvedCount / totalFeedback) * 100) : 0,
        },
        trend: dailyFeedback,
        recentFeedback: feedbackResults.slice(0, 10).map((f) => ({
          id: f.id,
          category: f.category,
          subject: f.subject,
          status: f.status,
          createdAt: f.createdAt,
        })),
      };
    }),

  /**
   * Export analytics data as JSON for reports
   */
  exportAnalytics: protectedProcedure
    .input(
      z.object({
        agencyId: z.number(),
        days: z.number().min(1).max(90).default(30),
        sections: z.array(z.enum(["search", "protocol", "user", "error"])).default(["search", "protocol", "user", "error"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const exportData: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        agencyId: input.agencyId,
        periodDays: input.days,
        sections: input.sections,
      };

      // For now, return a summary that can be generated client-side
      // Full implementation would call each analytics endpoint
      return {
        ...exportData,
        note: "Call individual analytics endpoints for full data export",
      };
    }),
};
