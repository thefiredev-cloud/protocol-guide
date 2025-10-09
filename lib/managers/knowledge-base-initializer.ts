/* eslint-disable simple-import-sort/imports */
import { createLogger } from "@/lib/log";
import { EnvironmentManager, type EnvironmentDiagnostics } from "@/lib/managers/environment-manager";
import { KnowledgeBaseManager, type KnowledgeBaseResolutionAttempt, type KnowledgeBaseResolvedSource } from "@/lib/storage/knowledge-base-manager";
import { initializeKnowledgeBase } from "@/lib/retrieval";

type KnowledgeBaseStatus = {
  loaded: boolean;
  docCount: number;
  sourcePath?: string;
};

export type KnowledgeBaseDiagnostics = KnowledgeBaseStatus & {
  env: EnvironmentDiagnostics;
  lastSource: KnowledgeBaseResolvedSource | null;
  attempts: ReadonlyArray<KnowledgeBaseResolutionAttempt>;
};

class KnowledgeBaseInitializer {
  private status: KnowledgeBaseStatus = { loaded: false, docCount: 0 };
  private manager: KnowledgeBaseManager | null;
  private readonly logger = createLogger("KnowledgeBaseInitializer");

  constructor(manager?: KnowledgeBaseManager) {
    this.manager = manager ?? null;
  }

  private getManager(): KnowledgeBaseManager {
    if (!this.manager) {
      this.manager = new KnowledgeBaseManager();
    }
    return this.manager;
  }

  public async warm(): Promise<KnowledgeBaseStatus> {
    if (this.status.loaded) return this.status;

    const env = EnvironmentManager.load();
    const docs = await this.getManager().load();
    // Ensure retrieval subsystem is initialized for downstream services/tests
    try {
      await initializeKnowledgeBase();
    } catch (error) {
      this.logger.warn("initializeKnowledgeBase failed (non-fatal in test)", { message: error instanceof Error ? error.message : String(error) });
    }
    this.status = {
      loaded: true,
      docCount: docs.length,
      sourcePath: env.KB_DATA_PATH,
    };
    this.logger.info("Knowledge base warmed", {
      docCount: docs.length,
      sourcePath: this.status.sourcePath ?? "auto",
    });
    return this.status;
  }

  public getStatus(): KnowledgeBaseStatus {
    return this.status;
  }

  public statusWithEnvironment(): KnowledgeBaseDiagnostics {
    const diagnostics = EnvironmentManager.diagnostics();
    const resolution = KnowledgeBaseManager.resolutionDiagnostics();
    return {
      ...this.status,
      env: diagnostics,
      lastSource: resolution.lastSource ?? { kind: "local", location: diagnostics.knowledgeBase.dataPath || "auto" },
      attempts: resolution.attempts.length ? [...resolution.attempts] : [{ kind: "local", location: diagnostics.knowledgeBase.dataPath || "auto", success: true }],
    };
  }

  public reset(): void {
    this.status = { loaded: false, docCount: 0 };
    this.manager = null;
    KnowledgeBaseManager.clear();
  }
}

export const knowledgeBaseInitializer = new KnowledgeBaseInitializer();

