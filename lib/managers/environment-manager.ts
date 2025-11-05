import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LLM_API_KEY: z
    .string({ required_error: "LLM_API_KEY is required. Please add it to your .env.local file." })
    .min(1, { message: "LLM_API_KEY is required. Please add it to your .env.local file." }),
  LLM_BASE_URL: z.string().url("LLM_BASE_URL must be a valid URL").optional(),
  LLM_MODEL: z.string().min(1).default("gpt-4o-mini"),
  KB_SCOPE: z
    .string()
    .default("pcm")
    .transform((value) => value.trim().toLowerCase())
    .refine((value) => value === "pcm", {
      message: "KB_SCOPE must be 'pcm' to comply with LA County restrictions.",
    }),
  KB_SOURCE: z
    .string()
    .default("clean")
    .transform((value) => value.trim().toLowerCase())
    .refine((value) => value === "clean", {
      message: "KB_SOURCE must be 'clean'.",
    }),
  KB_DATA_PATH: z.string().optional(),
  KB_REMOTE_URL: z.string().url().optional(),
  KB_REMOTE_BASE_URL: z.string().url().optional(),
  ENABLE_MARKDOWN_PREPROCESSING: z
    .string()
    .default("false")
    .transform((val) => val.toLowerCase() === "true"),
  MARKDOWN_CHUNK_SIZE: z
    .string()
    .default("2000")
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => val > 0 && val <= 10000, {
      message: "MARKDOWN_CHUNK_SIZE must be between 1 and 10000",
    }),
  MARKDOWN_CONTEXT_LIMIT: z
    .string()
    .default("12000")
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => val > 0 && val <= 50000, {
      message: "MARKDOWN_CONTEXT_LIMIT must be between 1 and 50000",
    }),
});

export type EnvironmentConfig = z.infer<typeof schema> & {
  llmBaseUrl: string;
  llmModel: string;
  kbScope: string;
  kbSource: string;
  enableMarkdownPreprocessing: boolean;
  markdownChunkSize: number;
  markdownContextLimit: number;
};

export type EnvironmentDiagnostics = {
  nodeEnv: EnvironmentConfig["NODE_ENV"];
  llm: {
    baseUrl: string;
    model: string;
    apiKeyConfigured: boolean;
  };
  knowledgeBase: {
    scope: string;
    source: string;
    dataPath?: string;
    remoteUrl?: string;
    remoteBaseUrl?: string;
  };
};

/**
 * Manages environment configuration loading and validation
 * Provides singleton access to validated environment variables
 */
export class EnvironmentManager {
  private static cached: EnvironmentConfig | null = null;

  /**
   * Load and validate environment configuration
   * Throws error if required variables are missing or invalid
   */
  public static load(): EnvironmentConfig {
    if (!EnvironmentManager.cached) {
      const parsed = schema.safeParse(process.env);
      if (!parsed.success) {
        const message = parsed.error.issues.map((issue) => issue.message).join("; ");
        throw new Error(`Invalid environment configuration: ${message}`);
      }

      const env = parsed.data;
      EnvironmentManager.cached = {
        ...env,
        llmBaseUrl: env.LLM_BASE_URL ?? "https://api.openai.com/v1",
        llmModel: env.LLM_MODEL,
        kbScope: env.KB_SCOPE,
        kbSource: env.KB_SOURCE,
        enableMarkdownPreprocessing: env.ENABLE_MARKDOWN_PREPROCESSING,
        markdownChunkSize: env.MARKDOWN_CHUNK_SIZE,
        markdownContextLimit: env.MARKDOWN_CONTEXT_LIMIT,
      };
    }

    return EnvironmentManager.cached;
  }

  /**
   * Safe load that handles errors gracefully in production
   * Throws only in development to catch configuration issues early
   * In production, returns fallback config and logs errors for monitoring
   */
  public static loadSafe(): EnvironmentConfig {
    try {
      return EnvironmentManager.load();
    } catch (error) {
      const isDevelopment = process.env.NODE_ENV === "development";
      const errorMessage = error instanceof Error ? error.message : String(error);

      // In development, throw to catch config issues early
      if (isDevelopment) {
        throw error;
      }

      // In production, log error and return minimal fallback
      // This prevents user-facing errors while maintaining functionality
      console.error(`[EnvironmentManager] Configuration error (production fallback): ${errorMessage}`);

      // Return minimal fallback config for production
      // This allows the app to function even if some env vars are missing
      return {
        NODE_ENV: "production",
        LLM_API_KEY: "", // Will be caught by LLMClient as unavailable
        LLM_BASE_URL: process.env.LLM_BASE_URL ?? "https://api.openai.com/v1",
        LLM_MODEL: process.env.LLM_MODEL ?? "gpt-4o-mini",
        KB_SCOPE: "pcm",
        KB_SOURCE: "clean",
        KB_DATA_PATH: process.env.KB_DATA_PATH,
        KB_REMOTE_URL: process.env.KB_REMOTE_URL,
        KB_REMOTE_BASE_URL: process.env.KB_REMOTE_BASE_URL,
        ENABLE_MARKDOWN_PREPROCESSING: false,
        MARKDOWN_CHUNK_SIZE: 2000,
        MARKDOWN_CONTEXT_LIMIT: 12000,
        llmBaseUrl: process.env.LLM_BASE_URL ?? "https://api.openai.com/v1",
        llmModel: process.env.LLM_MODEL ?? "gpt-4o-mini",
        kbScope: "pcm",
        kbSource: "clean",
        enableMarkdownPreprocessing: false,
        markdownChunkSize: 2000,
        markdownContextLimit: 12000,
      };
    }
  }

  /**
   * Get environment diagnostics for troubleshooting
   * Returns configuration details without exposing sensitive values
   */
  public static diagnostics(): EnvironmentDiagnostics {
    const env = EnvironmentManager.load();
    return {
      nodeEnv: env.NODE_ENV,
      llm: {
        baseUrl: env.llmBaseUrl,
        model: env.llmModel,
        apiKeyConfigured: Boolean(env.LLM_API_KEY?.length),
      },
      knowledgeBase: {
        scope: env.kbScope,
        source: env.kbSource,
        dataPath: env.KB_DATA_PATH || undefined,
        remoteUrl: env.KB_REMOTE_URL || undefined,
        remoteBaseUrl: env.KB_REMOTE_BASE_URL || undefined,
      },
    };
  }

  /**
   * Reset cached environment configuration (for testing)
   */
  public static reset(): void {
    EnvironmentManager.cached = null;
  }
}