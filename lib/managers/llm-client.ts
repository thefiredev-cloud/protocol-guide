type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
};

type ChatPayload = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: unknown;
    };
  }>;
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
};

type FetchFn = typeof fetch;

type CircuitState = "closed" | "open" | "half-open";

export type LLMClientConfig = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
  maxRetries?: number;
  breakerFailureThreshold?: number;
  breakerResetMs?: number;
  fetchImpl?: FetchFn;
};

export type LLMClientResult =
  | { type: "success"; text: string; functionCalls?: never }
  | { type: "function-call"; functionCalls: Array<{ name: string; arguments: unknown; id: string }>; text?: never }
  | { type: "circuit-open" }
  | { type: "error"; message: string };

export type FunctionCallHandler = (name: string, args: unknown) => Promise<unknown>;
export type FunctionCallRateLimiter = (sessionId: string) => {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export class LLMClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly breakerFailureThreshold: number;
  private readonly breakerResetMs: number;
  private readonly fetchImpl: FetchFn;

  private state: CircuitState = "closed";
  private failures = 0;
  private nextAttemptAt = 0;

  constructor(config: LLMClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 12_000;
    this.maxRetries = config.maxRetries ?? 2;
    this.breakerFailureThreshold = config.breakerFailureThreshold ?? 3;
    this.breakerResetMs = config.breakerResetMs ?? 30_000;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  public getBreakerState(): CircuitState {
    return this.state;
  }

  public async sendChat(
    payload: ChatPayload,
    functionCallHandler?: FunctionCallHandler,
    sessionId?: string,
    rateLimiter?: FunctionCallRateLimiter,
  ): Promise<LLMClientResult> {

    if (this.isCircuitOpen()) {
      return { type: "circuit-open" };
    }

    // If no function handler provided, fall back to simple request
    if (!functionCallHandler || !payload.tools || payload.tools.length === 0) {
      const result = await this.trySendWithRetries(payload);
      if (result.type === "error") {
      }
      this.handlePostAttempt(result);
      return result;
    }

    // Execute function calling loop with rate limiting
    return this.executeFunctionCallingLoop(payload, functionCallHandler, 5, sessionId, rateLimiter);
  }

  private async executeFunctionCallingLoop(
    payload: ChatPayload,
    functionCallHandler: FunctionCallHandler,
    maxIterations = 5,
    sessionId?: string,
    rateLimiter?: FunctionCallRateLimiter,
  ): Promise<LLMClientResult> {
    let currentMessages = [...payload.messages];
    let iteration = 0;


    while (iteration < maxIterations) {

      // Check rate limit if provided
      if (rateLimiter && sessionId) {
        const limitCheck = rateLimiter(sessionId);
        if (!limitCheck.allowed) {
          return {
            type: "error",
            message: `Function call rate limit exceeded. Maximum ${maxIterations} function calls per session.`,
          };
        }
      }
      const iterationPayload: ChatPayload = {
        ...payload,
        messages: currentMessages,
        tool_choice: iteration === 0 ? "auto" : payload.tool_choice ?? "auto",
      };

      const result = await this.trySendWithRetries(iterationPayload);

      if (result.type === "error" || result.type === "circuit-open") {
        this.handlePostAttempt(result);
        return result;
      }

      if (result.type === "function-call" && result.functionCalls.length > 0) {
        // Execute function calls and add results to conversation
        for (const call of result.functionCalls) {
          try {
            const functionResult = await functionCallHandler(call.name, call.arguments);

            // Add assistant message with function calls
            currentMessages.push({
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: call.id,
                  type: "function",
                  function: {
                    name: call.name,
                    arguments: JSON.stringify(call.arguments),
                  },
                },
              ],
            });

            // Add function result message
            currentMessages.push({
              role: "tool",
              content: JSON.stringify(functionResult),
              tool_call_id: call.id,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            currentMessages.push({
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: call.id,
                  type: "function",
                  function: {
                    name: call.name,
                    arguments: JSON.stringify(call.arguments),
                  },
                },
              ],
            });
            currentMessages.push({
              role: "tool",
              content: JSON.stringify({ error: errorMessage }),
              tool_call_id: call.id,
            });
          }
        }

        iteration += 1;
        continue;
      }

      // Got final answer
      if (result.type === "success") {
        this.handlePostAttempt(result);
        return result;
      }

      // Unexpected result type
      return { type: "error", message: "Unexpected result type from LLM" };
    }

    // Max iterations reached
    return { type: "error", message: "Function calling loop exceeded maximum iterations" };
  }

  private handlePostAttempt(result: LLMClientResult): void {
    if (result.type === "success") {
      this.resetBreaker();
      return;
    }
    if (result.type === "error") {
      this.recordFailure();
    }
  }

  private async trySendWithRetries(payload: ChatPayload): Promise<LLMClientResult> {
    let attempt = 0;
    let lastError: string | null = null;

    while (attempt <= this.maxRetries) {
      const result = await this.trySendOnce(payload).catch<LLMClientResult>((error) => {
        lastError = error instanceof Error ? error.message : String(error);
        return { type: "error", message: lastError };
      });

      // Success or function-call are both valid responses - return immediately
      if (result.type === "success" || result.type === "function-call") {
        return result;
      }

      if (result.type === "error") {
      }

      await this.waitForBackoff(attempt);
      attempt += 1;
    }

    return { type: "error", message: lastError ?? "Unknown LLM failure" };
  }

  private async trySendOnce(payload: ChatPayload): Promise<LLMClientResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {

      const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });


      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`LLM error ${response.status}: ${text}`);
      }

      const body = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string | null;
            tool_calls?: Array<{
              id: string;
              type: "function";
              function: {
                name: string;
                arguments: string;
              };
            }>;
          };
        }>;
      };

      const choice = body.choices?.[0];
      const message = choice?.message;


      if (!message) {
        return { type: "error", message: "No message in LLM response" };
      }

      // Check for function calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        const functionCalls = message.tool_calls.map((call) => ({
          id: call.id,
          name: call.function.name,
          arguments: JSON.parse(call.function.arguments) as unknown,
        }));

        return { type: "function-call", functionCalls };
      }

      // Regular text response
      const text = message.content ?? "";
      return { type: "success", text };
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private async waitForBackoff(attempt: number): Promise<void> {
    if (attempt === this.maxRetries) return;
    const delay = Math.min(1500 * 2 ** attempt, 6000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private isCircuitOpen(): boolean {
    if (this.state === "open" && Date.now() > this.nextAttemptAt) {
      this.state = "half-open";
      return false;
    }
    return this.state === "open";
  }

  private recordFailure(): void {
    this.failures += 1;
    if (this.failures >= this.breakerFailureThreshold) {
      this.state = "open";
      this.nextAttemptAt = Date.now() + this.breakerResetMs;
    }
  }

  private resetBreaker(): void {
    this.state = "closed";
    this.failures = 0;
    this.nextAttemptAt = 0;
  }
}

