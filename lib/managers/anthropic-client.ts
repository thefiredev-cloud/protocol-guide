/**
 * Anthropic Claude API Client
 * Implements Claude Messages API format with function calling support
 * Uses native fetch (no SDK) for maximum control and minimal dependencies
 */

import { ClaudeConverter } from "./claude-converter";
import type { ChatPayload, ClaudeContentBlock, ClaudeMessage, ClaudePayload, ClaudeResponse } from "./claude-types";

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

export class AnthropicClient {
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
    this.timeoutMs = config.timeoutMs ?? 30_000; // Claude needs more time
    this.maxRetries = config.maxRetries ?? 2;
    this.breakerFailureThreshold = config.breakerFailureThreshold ?? 3;
    this.breakerResetMs = config.breakerResetMs ?? 30_000;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  public getBreakerState(): CircuitState {
    return this.state;
  }

  /**
   * Send chat with OpenAI-compatible interface
   * Internally converts to Claude format
   */
  public async sendChat(
    payload: ChatPayload,
    functionCallHandler?: FunctionCallHandler,
    sessionId?: string,
    rateLimiter?: FunctionCallRateLimiter,
  ): Promise<LLMClientResult> {
    if (this.isCircuitOpen()) {
      return { type: "circuit-open" };
    }

    // Convert OpenAI format to Claude format
    const claudePayload = this.convertToClaude(payload);

    // If no function handler provided, fall back to simple request
    if (!functionCallHandler || !claudePayload.tools || claudePayload.tools.length === 0) {
      const result = await this.trySendWithRetries(claudePayload);
      this.handlePostAttempt(result);
      return result;
    }

    // Execute function calling loop with rate limiting
    return this.executeFunctionCallingLoop(claudePayload, {
      functionCallHandler,
      maxIterations: 5,
      sessionId,
      rateLimiter,
    });
  }

  private async executeFunctionCallingLoop(
    initialPayload: ClaudePayload,
    options: {
      functionCallHandler: FunctionCallHandler;
      maxIterations: number;
      sessionId?: string;
      rateLimiter?: FunctionCallRateLimiter;
    },
  ): Promise<LLMClientResult> {
    const { functionCallHandler, maxIterations, sessionId, rateLimiter } = options;
    const currentMessages = [...initialPayload.messages];
    let iteration = 0;

    while (iteration < maxIterations) {
      const rateLimitError = this.checkRateLimit(rateLimiter, sessionId, maxIterations);
      if (rateLimitError) return rateLimitError;

      const iterationPayload: ClaudePayload = {
        ...initialPayload,
        messages: currentMessages,
        tool_choice: iteration === 0 ? { type: "auto" } : initialPayload.tool_choice ?? { type: "auto" },
      };

      const result = await this.trySendWithRetries(iterationPayload);

      if (result.type === "error" || result.type === "circuit-open") {
        this.handlePostAttempt(result);
        return result;
      }

      if (result.type === "function-call" && result.functionCalls.length > 0) {
        await this.processFunctionCalls(result.functionCalls, functionCallHandler, currentMessages);
        iteration += 1;
        continue;
      }

      if (result.type === "success") {
        this.handlePostAttempt(result);
        return result;
      }

      return { type: "error", message: "Unexpected result type from Claude" };
    }

    return { type: "error", message: "Function calling loop exceeded maximum iterations" };
  }

  private checkRateLimit(
    rateLimiter: FunctionCallRateLimiter | undefined,
    sessionId: string | undefined,
    maxIterations: number,
  ): LLMClientResult | null {
    if (rateLimiter && sessionId) {
      const limitCheck = rateLimiter(sessionId);
      if (!limitCheck.allowed) {
        return {
          type: "error",
          message: `Function call rate limit exceeded. Maximum ${maxIterations} function calls per session.`,
        };
      }
    }
    return null;
  }

  private async processFunctionCalls(
    functionCalls: Array<{ name: string; arguments: unknown; id: string }>,
    functionCallHandler: FunctionCallHandler,
    currentMessages: ClaudeMessage[],
  ): Promise<void> {
    // Add assistant message with tool uses
    const toolUseBlocks: ClaudeContentBlock[] = functionCalls.map((call) => ({
      type: "tool_use",
      id: call.id,
      name: call.name,
      input: call.arguments,
    }));

    currentMessages.push({
      role: "assistant",
      content: toolUseBlocks,
    });

    // Execute function calls and build tool results
    const toolResultBlocks = await this.executeToolCalls(functionCalls, functionCallHandler);

    // Add user message with tool results
    currentMessages.push({
      role: "user",
      content: toolResultBlocks,
    });
  }

  private async executeToolCalls(
    functionCalls: Array<{ name: string; arguments: unknown; id: string }>,
    functionCallHandler: FunctionCallHandler,
  ): Promise<ClaudeContentBlock[]> {
    const toolResultBlocks: ClaudeContentBlock[] = [];

    for (const call of functionCalls) {
      try {
        const functionResult = await functionCallHandler(call.name, call.arguments);

        toolResultBlocks.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify(functionResult),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toolResultBlocks.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify({ error: errorMessage }),
        });
      }
    }

    return toolResultBlocks;
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

  private async trySendWithRetries(payload: ClaudePayload): Promise<LLMClientResult> {
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
        console.error(`[AnthropicClient] Attempt ${attempt + 1}/${this.maxRetries + 1} failed:`, result.message);
      }

      await this.waitForBackoff(attempt);
      attempt += 1;
    }

    return { type: "error", message: lastError ?? "Unknown Claude API failure" };
  }

  private async trySendOnce(payload: ClaudePayload): Promise<LLMClientResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Claude API error ${response.status}: ${text}`);
      }

      const body = (await response.json()) as ClaudeResponse;
      return this.parseClaudeResponse(body);
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseClaudeResponse(body: ClaudeResponse): LLMClientResult {
    if (!body.content || body.content.length === 0) {
      return { type: "error", message: "No content in Claude response" };
    }

    // Check for tool uses
    const toolUses = body.content.filter((block) => block.type === "tool_use") as Array<{
      type: "tool_use";
      id: string;
      name: string;
      input: unknown;
    }>;

    if (toolUses.length > 0) {
      const functionCalls = toolUses.map((toolUse) => ({
        id: toolUse.id,
        name: toolUse.name,
        arguments: toolUse.input,
      }));

      return { type: "function-call", functionCalls };
    }

    // Extract text from content blocks
    const textBlocks = body.content.filter((block) => block.type === "text") as Array<{
      type: "text";
      text: string;
    }>;

    const text = textBlocks.map((block) => block.text).join("\n");
    return { type: "success", text };
  }

  private buildHeaders(): Record<string, string> {
    return {
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
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

  /**
   * Convert OpenAI-format payload to Claude format
   */
  private convertToClaude(payload: ChatPayload): ClaudePayload {
    return ClaudeConverter.convertPayload(payload);
  }

  /**
   * Stream chat messages with Server-Sent Events
   * Returns async iterator for streaming responses
   */
  public async *streamChat(
    payload: ChatPayload,
  ): AsyncGenerator<
    | { type: "content_block_start"; content_type: "text" | "tool_use" }
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } | { type: "input_json_delta"; partial_json: string } }
    | { type: "message_delta"; delta: { stop_reason: string | null } }
    | { type: "message_stop" }
    | { type: "error"; error: string },
    void,
    unknown
  > {
    if (this.isCircuitOpen()) {
      yield { type: "error", error: "Circuit breaker is open" };
      return;
    }

    const claudePayload = this.convertToClaude(payload);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchStreamRequest(claudePayload, controller.signal);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        yield { type: "error", error: `Claude API error ${response.status}: ${text}` };
        return;
      }

      if (!response.body) {
        yield { type: "error", error: "No response body" };
        return;
      }

      yield* this.processStreamResponse(response.body);
      this.resetBreaker();
    } catch (error) {
      this.recordFailure();
      const errorMessage = error instanceof Error ? error.message : String(error);
      yield { type: "error", error: errorMessage };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchStreamRequest(payload: ClaudePayload, signal: AbortSignal): Promise<Response> {
    return this.fetchImpl(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        ...this.buildHeaders(),
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        ...payload,
        stream: true,
      }),
      signal,
    });
  }

  private async *processStreamResponse(
    body: ReadableStream<Uint8Array>,
  ): AsyncGenerator<
    | { type: "content_block_start"; content_type: "text" | "tool_use" }
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } | { type: "input_json_delta"; partial_json: string } }
    | { type: "message_delta"; delta: { stop_reason: string | null } }
    | { type: "message_stop" },
    void,
    unknown
  > {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      const shouldStop = yield* this.processStreamLines(lines);
      if (shouldStop) return;
    }
  }

  private *processStreamLines(
    lines: string[],
  ): Generator<
    | { type: "content_block_start"; content_type: "text" | "tool_use" }
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } | { type: "input_json_delta"; partial_json: string } }
    | { type: "message_delta"; delta: { stop_reason: string | null } }
    | { type: "message_stop" },
    boolean,
    unknown
  > {
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const event = this.parseStreamEvent(line.slice(6));
      if (!event) continue;

      yield event;
      if (event.type === "message_stop") return true;
    }
    return false;
  }

  private parseStreamEvent(
    data: string,
  ):
    | { type: "content_block_start"; content_type: "text" | "tool_use" }
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } | { type: "input_json_delta"; partial_json: string } }
    | { type: "message_delta"; delta: { stop_reason: string | null } }
    | { type: "message_stop" }
    | null {
    if (data === "[DONE]") return { type: "message_stop" };

    try {
      const event = JSON.parse(data) as {
        type: string;
        content_block?: { type: string };
        delta?: { type: string; text?: string; partial_json?: string; stop_reason?: string };
      };

      return this.mapStreamEvent(event);
    } catch (e) {
      return null;
    }
  }

  private mapStreamEvent(event: {
    type: string;
    content_block?: { type: string };
    delta?: { type: string; text?: string; partial_json?: string; stop_reason?: string };
  }):
    | { type: "content_block_start"; content_type: "text" | "tool_use" }
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } | { type: "input_json_delta"; partial_json: string } }
    | { type: "message_delta"; delta: { stop_reason: string | null } }
    | { type: "message_stop" }
    | null {
    if (event.type === "content_block_start" && event.content_block) {
      return {
        type: "content_block_start",
        content_type: event.content_block.type as "text" | "tool_use",
      };
    }

    if (event.type === "content_block_delta" && event.delta) {
      return this.mapDeltaEvent(event.delta);
    }

    if (event.type === "message_delta" && event.delta) {
      return { type: "message_delta", delta: { stop_reason: event.delta.stop_reason || null } };
    }

    if (event.type === "message_stop") {
      return { type: "message_stop" };
    }

    return null;
  }

  private mapDeltaEvent(delta: {
    type: string;
    text?: string;
    partial_json?: string;
  }):
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } | { type: "input_json_delta"; partial_json: string } }
    | null {
    if (delta.type === "text_delta" && delta.text) {
      return { type: "content_block_delta", delta: { type: "text_delta", text: delta.text } };
    }
    if (delta.type === "input_json_delta" && delta.partial_json) {
      return { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: delta.partial_json } };
    }
    return null;
  }
}
