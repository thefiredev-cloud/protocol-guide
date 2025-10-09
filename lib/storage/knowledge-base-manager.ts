import { promises as fs } from "node:fs";
import path from "node:path";

import { EnvironmentManager } from "@/lib/managers/environment-manager";

export type KnowledgeBaseAsset = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  content: string;
};

export type KnowledgeBaseSourceKind = "local" | "remote";

export type KnowledgeBaseResolvedSource = {
  kind: KnowledgeBaseSourceKind;
  location: string;
};

export type KnowledgeBaseResolutionAttempt = KnowledgeBaseResolvedSource & {
  success: boolean;
};

export type KnowledgeBaseResolutionDiagnostics = {
  lastSource: KnowledgeBaseResolvedSource | null;
  attempts: ReadonlyArray<KnowledgeBaseResolutionAttempt>;
};

type KnowledgeBaseResolutionState = {
  lastSource: KnowledgeBaseResolvedSource | null;
  attempts: KnowledgeBaseResolutionAttempt[];
};

type KnowledgeBaseSourceOptions = {
  absolutePath?: string;
  remoteUrl?: string;
};

export class KnowledgeBaseManager {
  private static cache: KnowledgeBaseAsset[] | null = null;
  private static resolutionState: KnowledgeBaseResolutionState = { lastSource: null, attempts: [] };
  private readonly options?: KnowledgeBaseSourceOptions;
  private readonly env = EnvironmentManager.load();

  constructor(options?: KnowledgeBaseSourceOptions) {
    this.options = options;
  }

  public async load(): Promise<KnowledgeBaseAsset[]> {
    if (!KnowledgeBaseManager.cache) {
      KnowledgeBaseManager.cache = await this.resolveAssets();
    }
    return KnowledgeBaseManager.cache;
  }

  public static clear(): void {
    KnowledgeBaseManager.cache = null;
    KnowledgeBaseManager.resolutionState = { lastSource: null, attempts: [] };
  }

  public static resolutionDiagnostics(): KnowledgeBaseResolutionDiagnostics {
    return {
      lastSource: KnowledgeBaseManager.resolutionState.lastSource,
      attempts: [...KnowledgeBaseManager.resolutionState.attempts],
    };
  }

  private async resolveAssets(): Promise<KnowledgeBaseAsset[]> {
    const tried: string[] = [];

    for (const candidate of this.resolveLocalPaths()) {
      tried.push(candidate);
      const assets = await this.tryLoadFromDisk(candidate);
      if (assets) return assets;
    }

    const remoteUrl = this.resolveRemoteUrl();
    if (remoteUrl) {
      tried.push(remoteUrl);
      const assets = await this.tryLoadFromRemote(remoteUrl);
      if (assets) return assets;
    }

    const message = tried.length
      ? `Knowledge base not found. Tried sources: ${tried.join(", ")}`
      : "Knowledge base not found. No sources configured.";
    throw new Error(message);
  }

  private resolveLocalPaths(): string[] {
    // If an explicit absolutePath is provided, only try that path.
    if (this.options?.absolutePath) {
      return [this.resolveToAbsolute(this.options.absolutePath)];
    }
    // If KB_DATA_PATH is configured, prefer only that path.
    if (this.env.KB_DATA_PATH) {
      return [this.resolveToAbsolute(this.env.KB_DATA_PATH)];
    }
    // Otherwise, try defaults in order.
    return [
      path.join(process.cwd(), "public", "kb", "ems_kb_clean.json"),
      path.join(process.cwd(), "data", "ems_kb_clean.json"),
    ];
  }

  private resolveRemoteUrl(): string | null {
    const configured = this.options?.remoteUrl ?? this.env.KB_REMOTE_URL;
    if (configured) return configured;
    const base =
      this.env.KB_REMOTE_BASE_URL ||
      process.env.DEPLOY_PRIME_URL ||
      process.env.DEPLOY_URL ||
      process.env.URL;
    if (!base) return null;
    try {
      const url = new URL("/kb/ems_kb_clean.json", base);
      return url.toString();
    } catch {
      return null;
    }
  }

  private resolveToAbsolute(candidate: string): string {
    return path.isAbsolute(candidate) ? candidate : path.join(process.cwd(), candidate);
  }

  private static recordAttempt(kind: KnowledgeBaseSourceKind, location: string, success: boolean): void {
    const attempts = KnowledgeBaseManager.resolutionState.attempts;
    attempts.push({ kind, location, success });
    if (attempts.length > 20) attempts.splice(0, attempts.length - 20);
    if (success) {
      KnowledgeBaseManager.resolutionState.lastSource = { kind, location };
    }
  }

  private async tryLoadFromDisk(candidate: string): Promise<KnowledgeBaseAsset[] | null> {
    try {
      const payload = await fs.readFile(candidate, "utf8");
      const parsed = JSON.parse(payload) as KnowledgeBaseAsset[];
      KnowledgeBaseManager.recordAttempt("local", candidate, true);
      return parsed;
    } catch (error: unknown) {
      KnowledgeBaseManager.recordAttempt("local", candidate, false);
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return null;
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  private async tryLoadFromRemote(url: string): Promise<KnowledgeBaseAsset[] | null> {
    try {
      const response = await fetch(url, { cache: "force-cache" });
      if (!response.ok) {
        KnowledgeBaseManager.recordAttempt("remote", url, false);
        return null;
      }
      const json = await response.json();
      KnowledgeBaseManager.recordAttempt("remote", url, true);
      return json as KnowledgeBaseAsset[];
    } catch (error: unknown) {
      // If remote fetch fails (e.g., offline build) swallow and fall back.
      KnowledgeBaseManager.recordAttempt("remote", url, false);
      console.warn(`[KB] Remote fetch failed for ${url}:`, error);
      return null;
    }
  }
}
