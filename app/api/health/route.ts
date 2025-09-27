import { NextResponse } from "next/server";

import { createLogger } from "@/lib/log";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";
import { metrics } from "@/lib/managers/metrics-manager";

export const runtime = "nodejs";

export async function GET() {
  const logger = createLogger("api.health");

  try {
    EnvironmentManager.load();
    const status = await knowledgeBaseInitializer.warm();
    const diagnostics = knowledgeBaseInitializer.statusWithEnvironment();
    return NextResponse.json({
      status: "ok",
      kb: {
        loaded: status.loaded,
        docCount: status.docCount,
        scope: diagnostics.env.knowledgeBase.scope,
        source: status.sourcePath ?? diagnostics.env.knowledgeBase.source ?? "auto",
        dataPath: diagnostics.env.knowledgeBase.dataPath,
        remoteUrl: diagnostics.env.knowledgeBase.remoteUrl,
        remoteBaseUrl: diagnostics.env.knowledgeBase.remoteBaseUrl,
        attempts: diagnostics.attempts,
        lastSource: diagnostics.lastSource,
      },
      llm: diagnostics.env.llm,
      runtime: diagnostics.env.nodeEnv,
      metrics: metrics.snapshot(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Health check failed", { message });
    return NextResponse.json({
      status: "error",
      error: {
        code: "KB_UNAVAILABLE",
        message,
      },
    }, { status: 503 });
  }
}

