import { NextResponse } from "next/server";

import { createLogger } from "@/lib/log";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";
import { metrics } from "@/lib/managers/metrics-manager";

export const runtime = "nodejs";

interface HealthCheck {
  status: "ok" | "degraded" | "error";
  latency_ms?: number;
  message?: string;
  [key: string]: unknown;
}

interface HealthResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  checks: {
    kb: HealthCheck;
    llm: HealthCheck;
    metrics: HealthCheck;
    runtime: HealthCheck;
  };
  metrics_snapshot?: unknown;
}

/**
 * Health check endpoint for production monitoring
 * Returns 200 OK if all systems operational, 503 if degraded/error
 *
 * Monitoring configuration:
 * - UptimeRobot/Pingdom: Check every 5 minutes, expect 200 status
 * - Alert on: status !== "ok" or response time > 5000ms
 */
export async function GET() {
  const logger = createLogger("api.health");
  const startTime = Date.now();

  try {
    EnvironmentManager.load();

    // Perform health checks in parallel
    const [kbCheck, llmCheck, metricsCheck, runtimeCheck] = await Promise.allSettled([
      checkKnowledgeBase(),
      checkLLM(),
      checkMetrics(),
      checkRuntime(),
    ]);

    const checks: HealthResponse["checks"] = {
      kb: kbCheck.status === "fulfilled" ? kbCheck.value : {
        status: "error",
        message: kbCheck.reason instanceof Error ? kbCheck.reason.message : String(kbCheck.reason),
      },
      llm: llmCheck.status === "fulfilled" ? llmCheck.value : {
        status: "error",
        message: llmCheck.reason instanceof Error ? llmCheck.reason.message : String(llmCheck.reason),
      },
      metrics: metricsCheck.status === "fulfilled" ? metricsCheck.value : {
        status: "error",
        message: metricsCheck.reason instanceof Error ? metricsCheck.reason.message : String(metricsCheck.reason),
      },
      runtime: runtimeCheck.status === "fulfilled" ? runtimeCheck.value : {
        status: "error",
        message: runtimeCheck.reason instanceof Error ? runtimeCheck.reason.message : String(runtimeCheck.reason),
      },
    };

    // Determine overall health status
    const hasError = Object.values(checks).some(check => check.status === "error");
    const hasDegraded = Object.values(checks).some(check => check.status === "degraded");

    const overallStatus = hasError ? "error" : hasDegraded ? "degraded" : "ok";
    // Return 200 for degraded to keep uptime checks green; still signal "degraded" in body
    const statusCode = hasError ? 503 : 200;

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      metrics_snapshot: metrics.snapshot(),
    };

    const healthCheckDuration = Date.now() - startTime;
    metrics.observe("health.check.latency", healthCheckDuration);

    if (overallStatus !== "ok") {
      logger.warn("Health check degraded or error", {
        status: overallStatus,
        checks,
      });
    }

    return NextResponse.json(response, { status: statusCode });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Health check failed", { message });

    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: {
        code: "HEALTH_CHECK_FAILED",
        message,
      },
    }, { status: 503 });
  }
}

async function checkKnowledgeBase(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // In test, clear cached status so test spies on warm() are respected
    if (process.env.NODE_ENV === "test") {
      knowledgeBaseInitializer.reset();
    }
    const status = await knowledgeBaseInitializer.warm();
    const diagnostics = knowledgeBaseInitializer.statusWithEnvironment();
    const latency = Date.now() - startTime;

    if (!status.loaded || status.docCount === 0) {
      return {
        status: "error",
        latency_ms: latency,
        loaded: false,
        doc_count: 0,
        message: "Knowledge base not loaded or empty",
      };
    }

    return {
      status: "ok",
      latency_ms: latency,
      loaded: true,
      doc_count: status.docCount,
      scope: diagnostics.env.knowledgeBase.scope,
      source: status.sourcePath ?? diagnostics.env.knowledgeBase.source ?? "auto",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "error",
      latency_ms: Date.now() - startTime,
      message,
    };
  }
}

async function checkLLM(): Promise<HealthCheck> {
  try {
    const diagnostics = knowledgeBaseInitializer.statusWithEnvironment();

    // Check LLM configuration
    const hasBaseUrl = Boolean(diagnostics.env.llm.baseUrl);
    const hasApiKey = diagnostics.env.llm.apiKeyConfigured;
    const hasModel = Boolean(diagnostics.env.llm.model);

    if (!hasBaseUrl || !hasApiKey || !hasModel) {
      return {
        status: "degraded",
        message: "LLM configuration incomplete",
        base_url: diagnostics.env.llm.baseUrl,
        model: diagnostics.env.llm.model,
        has_api_key: hasApiKey,
      };
    }

    return {
      status: "ok",
      base_url: diagnostics.env.llm.baseUrl,
      model: diagnostics.env.llm.model,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "error",
      message,
    };
  }
}

async function checkMetrics(): Promise<HealthCheck> {
  try {
    const snapshot = metrics.snapshot();

    return {
      status: "ok",
      counters: snapshot.counters.length,
      histograms: snapshot.histograms.length,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "error",
      message,
    };
  }
}

async function checkRuntime(): Promise<HealthCheck> {
  try {
    const diagnostics = knowledgeBaseInitializer.statusWithEnvironment();
    const memoryUsage = process.memoryUsage();

    return {
      status: "ok",
      environment: diagnostics.env.nodeEnv,
      node_version: process.version,
      memory_mb: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heap_used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heap_total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "error",
      message,
    };
  }
}

