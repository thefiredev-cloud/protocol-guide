import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

import { createLogger } from "@/lib/log";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";

export const runtime = "nodejs";

interface RAGHealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    llmApiKey: { ok: boolean; message: string };
    knowledgeBase: { ok: boolean; docCount: number; message: string };
    protocolMetadata: { ok: boolean; entryCount: number; baseContactCount: number; message: string };
  };
  recommendations: string[];
}

/**
 * RAG System Health Check
 * Validates all components required for retrieval-augmented generation
 *
 * Use this endpoint to verify system readiness before pilot deployment
 */
export async function GET() {
  const logger = createLogger("api.health.rag");
  const recommendations: string[] = [];

  try {
    // Check 1: LLM API Key
    let llmApiKeyOk = false;
    let llmMessage = "";
    try {
      const env = EnvironmentManager.load();
      llmApiKeyOk = Boolean(env.LLM_API_KEY && env.LLM_API_KEY.trim().length > 0);
      llmMessage = llmApiKeyOk
        ? `API key configured for ${env.LLM_PROVIDER}`
        : "API key missing or empty";

      if (!llmApiKeyOk) {
        recommendations.push("Set LLM_API_KEY environment variable");
      }
    } catch (error) {
      llmMessage = error instanceof Error ? error.message : "Failed to load environment";
      recommendations.push("Fix environment configuration errors");
    }

    // Check 2: Knowledge Base
    let kbOk = false;
    let kbDocCount = 0;
    let kbMessage = "";
    try {
      const status = await knowledgeBaseInitializer.warm();
      kbOk = status.loaded && status.docCount > 0;
      kbDocCount = status.docCount;
      kbMessage = kbOk
        ? `Loaded ${status.docCount} documents`
        : "Knowledge base not loaded or empty";

      if (!kbOk) {
        recommendations.push("Ensure knowledge base files exist in data/ directory");
      }
    } catch (error) {
      kbMessage = error instanceof Error ? error.message : "Failed to initialize knowledge base";
      recommendations.push("Check knowledge base initialization errors");
    }

    // Check 3: Protocol Metadata
    let metadataOk = false;
    let entryCount = 0;
    let baseContactCount = 0;
    let metadataMessage = "";
    try {
      const metadataPath = path.join(process.cwd(), "data", "protocol-metadata.json");

      if (fs.existsSync(metadataPath)) {
        const data = fs.readFileSync(metadataPath, "utf-8");
        const metadata = JSON.parse(data) as Array<{
          baseContact?: { required?: boolean };
        }>;

        entryCount = metadata.length;
        baseContactCount = metadata.filter(
          (m) => m.baseContact?.required === true
        ).length;

        metadataOk = entryCount > 0;
        metadataMessage = `${entryCount} entries, ${baseContactCount} with base contact required`;

        if (baseContactCount < 10) {
          recommendations.push(
            "Enrich protocol metadata with base hospital contact requirements (Ref 1200.2)"
          );
        }
      } else {
        metadataMessage = "Protocol metadata file not found";
        recommendations.push("Create data/protocol-metadata.json with LA County protocols");
      }
    } catch (error) {
      metadataMessage = error instanceof Error ? error.message : "Failed to load protocol metadata";
      recommendations.push("Fix protocol metadata file format");
    }

    // Determine overall status
    const allOk = llmApiKeyOk && kbOk && metadataOk;
    const someOk = llmApiKeyOk || kbOk || metadataOk;
    const status: RAGHealthCheck["status"] = allOk
      ? "healthy"
      : someOk
        ? "degraded"
        : "unhealthy";

    const response: RAGHealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        llmApiKey: { ok: llmApiKeyOk, message: llmMessage },
        knowledgeBase: { ok: kbOk, docCount: kbDocCount, message: kbMessage },
        protocolMetadata: { ok: metadataOk, entryCount, baseContactCount, message: metadataMessage },
      },
      recommendations,
    };

    const statusCode = status === "unhealthy" ? 503 : 200;

    if (status !== "healthy") {
      logger.warn("RAG health check not healthy", { status, recommendations });
    }

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("RAG health check failed", { message });

    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: message,
      recommendations: ["Fix critical system errors before deployment"],
    }, { status: 503 });
  }
}
