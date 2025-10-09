import { NextRequest, NextResponse } from "next/server";

import { createLogger } from "@/lib/log";
import { metrics } from "@/lib/managers/metrics-manager";

export const runtime = "nodejs";

/**
 * Cron endpoint for flushing metrics to persistent storage
 * Should be called every 5 minutes by external cron service (e.g., Netlify Scheduled Functions)
 *
 * Configuration:
 * 1. Set CRON_SECRET in environment variables
 * 2. Configure external cron to call this endpoint with Authorization header
 *
 * Example Netlify scheduled function (netlify.toml):
 *
 * [[plugins]]
 *   package = "@netlify/plugin-scheduled-functions"
 *   [plugins.inputs]
 *     [[plugins.inputs.jobs]]
 *       schedule = "every 5 minutes"
 *       url = "/api/cron/flush-metrics"
 */
export async function GET(req: NextRequest) {
  const logger = createLogger("api.cron.flush-metrics");

  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET) {
      logger.warn("CRON_SECRET not configured", {});
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== expectedAuth) {
      logger.warn("Unauthorized metrics flush attempt", {
        hasAuth: Boolean(authHeader),
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Flush metrics
    const startTime = Date.now();
    await metrics.flushMetrics();
    const flushDuration = Date.now() - startTime;

    const snapshot = metrics.snapshot();

    logger.info("Metrics flushed successfully", {
      duration_ms: flushDuration,
      counters_count: snapshot.counters.length,
      histograms_count: snapshot.histograms.length,
    });

    return NextResponse.json({
      success: true,
      flushed_at: new Date().toISOString(),
      duration_ms: flushDuration,
      metrics_snapshot: {
        counters: snapshot.counters.length,
        histograms: snapshot.histograms.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Metrics flush failed", { message });

    return NextResponse.json(
      {
        error: "Metrics flush failed",
        message,
      },
      { status: 500 }
    );
  }
}
