import type { ChatMessage } from "@/app/types/chat";
import { auditLogger } from "@/lib/audit/audit-logger";
import { createLogger } from "@/lib/log";
import type { CarePlan } from "@/lib/managers/CarePlanManager";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";
import type { FunctionCallHandler } from "@/lib/managers/llm-client";
import { LLMClient } from "@/lib/managers/llm-client";
import { metrics } from "@/lib/managers/metrics-manager";
import { RetrievalManager } from "@/lib/managers/RetrievalManager";
import { initializeKnowledgeBase } from "@/lib/retrieval";
import { ChatProfiler } from "@/lib/services/chat/chat-profiler";
import { CitationService } from "@/lib/services/chat/citation-service";
import { functionCallRateLimiter } from "@/lib/services/chat/function-call-rate-limiter";
import { GuardrailService } from "@/lib/services/chat/guardrail-service";
import { NarrativeResponseBuilder } from "@/lib/services/chat/narrative-response-builder";
import { PayloadBuilder } from "@/lib/services/chat/payload-builder";
import { ProtocolRetrievalService } from "@/lib/services/chat/protocol-retrieval-service";
import { ProtocolToolManager } from "@/lib/services/chat/protocol-tool-manager";
import { TriageService } from "@/lib/services/chat/triage-service";
import type { TriageResult } from "@/lib/triage";

type ChatMode = "chat" | "narrative" | undefined;

export type ChatRequest = {
  messages: ChatMessage[];
  mode?: ChatMode;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ChatResponse = {
  text: string;
  citations: Array<{ title: string; category: string; subcategory?: string }>;
  carePlan?: CarePlan | null;
  narrative?: {
    soap: unknown;
    chronological: unknown;
    nemsis: unknown;
  };
  triage?: TriageResult;
  research?: unknown;
  guardrailNotes?: string[];
  fallback?: boolean;
};

export class ChatService {
  private readonly env = EnvironmentManager.loadSafe();
  private readonly retrieval = new RetrievalManager();
  private readonly logger = createLogger("ChatService");
  private readonly llmClient: LLMClient;
  private readonly triageService: TriageService;
  private readonly payloadBuilder: PayloadBuilder;
  private readonly citationService: CitationService;
  private readonly guardrailService: GuardrailService;
  private readonly narrativeBuilder: NarrativeResponseBuilder;
  private readonly protocolRetrievalService = new ProtocolRetrievalService();

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient ?? new LLMClient({
      baseUrl: this.env.llmBaseUrl,
      apiKey: this.env.LLM_API_KEY,
      maxRetries: 2,
      timeoutMs: 12_000,
      // Explicitly inject global fetch so tests can spy on it reliably
      fetchImpl: (globalThis as unknown as { fetch: typeof fetch }).fetch,
    });
    this.triageService = new TriageService();
    this.payloadBuilder = new PayloadBuilder(this.env.llmModel, 0.2);
    this.citationService = new CitationService();
    this.guardrailService = new GuardrailService();
    this.narrativeBuilder = new NarrativeResponseBuilder();
  }

  public async warm(): Promise<void> {
    await knowledgeBaseInitializer.warm();
    // Ensure retrieval index is loaded even if warm() is mocked in tests
    await initializeKnowledgeBase();
  }

  /**
   * Handle chat request - main entry point
   */
  public async handle({ messages, mode, userId, sessionId, ipAddress, userAgent }: ChatRequest): Promise<ChatResponse> {
    const requestStart = Date.now();
    await this.warm();
    metrics.inc("chat.sessions");
    const profiler = new ChatProfiler();

    const latestUser = this.getLatestUserMessage(messages);
    const { triage, retrieval, profiler: updatedProfiler } = await this.performTriageAndRetrieval(latestUser, profiler);
    const { llmResult, citations, durationMs } = await this.invokeLLM({
      messages,
      triage,
      retrieval,
      sessionId,
      profiler: updatedProfiler,
      requestStart,
    });

    return this.processLLMResponse({
      llmResult,
      triage,
      citations,
      latestUser,
      mode,
      userId,
      sessionId,
      ipAddress,
      userAgent,
      durationMs,
      profiler: updatedProfiler,
    });
  }

  /**
   * Perform triage and protocol retrieval
   */
  private async performTriageAndRetrieval(latestUser: string, profiler: ChatProfiler) {
    profiler.markStart("triage");
    const triage = this.triageService.build(latestUser);
    profiler.markEnd("triage");

    profiler.markStart("retrieval");
    const searchQuery = this.triageService.buildSearchQuery(latestUser, triage);
    const retrieval = await this.retrieval.search({ rawText: searchQuery, maxChunks: 6 });
    profiler.markEnd("retrieval");

    return { triage, retrieval, profiler };
  }

  /**
   * Invoke LLM with protocol context
   */
  private async invokeLLM(args: {
    messages: ChatMessage[];
    triage: TriageResult;
    retrieval: Awaited<ReturnType<RetrievalManager["search"]>>;
    sessionId?: string;
    profiler: ChatProfiler;
    requestStart: number;
  }) {
    const { messages, triage, retrieval, sessionId, profiler, requestStart } = args;
    profiler.markStart("payload");
    const intake = this.triageService.buildIntake(triage);
    const tools = ProtocolToolManager.getTools();
    const payload = this.payloadBuilder.build(retrieval.context, intake, messages, tools);
    profiler.markEnd("payload");

    profiler.markStart("llm");
    const functionCallHandler = this.createFunctionCallHandler(sessionId);
    const rateLimiter = (sid: string) => functionCallRateLimiter.check(sid);
    const llmStart = Date.now();
    const llmResult = await this.llmClient.sendChat(payload, functionCallHandler, sessionId, rateLimiter);
    const llmDurationMs = Date.now() - llmStart;
    profiler.markEnd("llm");
    metrics.observe("llm.roundtripMs", llmDurationMs);

    const citations = this.citationService.build(retrieval.hits, triage);
    const durationMs = Date.now() - requestStart;

    return { llmResult, citations, durationMs };
  }

  /**
   * Process LLM response and apply guardrails
   */
  private async processLLMResponse(args: {
    llmResult: Awaited<ReturnType<LLMClient["sendChat"]>>;
    triage: TriageResult;
    citations: ChatResponse["citations"];
    latestUser: string;
    mode?: ChatMode;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    durationMs: number;
    profiler: ChatProfiler;
  }): Promise<ChatResponse> {
    const { llmResult, triage, citations, latestUser, mode, userId, sessionId, ipAddress, userAgent, durationMs, profiler } = args;

    profiler.markStart("guardrail");
    const guardrailOutcome = this.guardrailManagerCheck(llmResult, triage, citations);
    profiler.markEnd("guardrail");

    const protocolsReferenced = this.extractProtocolReferences(triage);

    // Handle guardrail fallback
    if (guardrailOutcome.type === "fallback") {
      return this.handleGuardrailFallback({ latestUser, triage, protocolsReferenced, userId, sessionId, ipAddress, userAgent, durationMs, response: guardrailOutcome.response });
    }

    // Evaluate response
    const evaluated = this.guardrailService.evaluate(guardrailOutcome.text);
    if (evaluated.type === "fallback") {
      return this.buildFallbackAndAudit({ latestUser, triage, citations, userId, sessionId, ipAddress, userAgent, durationMs, notes: evaluated.notes });
    }

    return this.buildSuccessResponse({ evaluated, triage, citations, mode, latestUser, protocolsReferenced, userId, sessionId, ipAddress, userAgent, durationMs, profiler });
  }

  /**
   * Extract protocol references for audit logging
   */
  private extractProtocolReferences(triage: TriageResult): string[] {
    return triage.matchedProtocols
      .slice(0, 3)
      .map((p) => `${p.tp_code} - ${p.tp_name}`);
  }

  /**
   * Handle guardrail fallback with audit logging
   */
  private async handleGuardrailFallback(args: {
    latestUser: string;
    triage: TriageResult;
    protocolsReferenced: string[];
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    durationMs: number;
    response: ChatResponse;
  }): Promise<ChatResponse> {
    const { latestUser, protocolsReferenced, userId, sessionId, ipAddress, userAgent, durationMs, response } = args;
    await auditLogger.logProtocolQuery({
      userId,
      sessionId,
      query: latestUser,
      protocolsReferenced,
      outcome: "failure",
      ipAddress,
      userAgent,
      durationMs,
      errorMessage: "Guardrail fallback triggered",
    });
    return response;
  }

  /**
   * Build success response with audit logging
   */
  private async buildSuccessResponse(args: {
    evaluated: { text: string; notes: string[]; dosingIssues?: string[] };
    triage: TriageResult;
    citations: ChatResponse["citations"];
    mode?: ChatMode;
    latestUser: string;
    protocolsReferenced: string[];
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    durationMs: number;
    profiler: ChatProfiler;
  }): Promise<ChatResponse> {
    const { evaluated, triage, citations, mode, latestUser, protocolsReferenced, userId, sessionId, ipAddress, userAgent, durationMs, profiler } = args;

    const text = evaluated.text;
    const notes = [...evaluated.notes, ...(evaluated.dosingIssues ?? [])];

    await auditLogger.logProtocolQuery({
      userId,
      sessionId,
      query: latestUser,
      protocolsReferenced,
      outcome: "success",
      ipAddress,
      userAgent,
      durationMs,
    });

    if (mode === "narrative") {
      profiler.markStart("narrative");
      const out = await this.narrativeBuilder.build(text, triage, citations, notes);
      profiler.markEnd("narrative");
      return out;
    }

    this.logger.info("Chat succeeded", {
      citationCount: citations.length,
      protocols: triage.matchedProtocols.map((protocol) => protocol.tp_code).slice(0, 3),
    });
    metrics.inc("chat.success");

    return {
      text,
      citations,
      triage,
      guardrailNotes: notes,
    };
  }

  private guardrailManagerCheck(
    llmResult: Awaited<ReturnType<LLMClient["sendChat"]>>,
    triage: TriageResult,
    citations: ChatResponse["citations"],
  ): { type: "fallback"; response: ChatResponse } | { type: "success"; text: string } {
    if (llmResult.type === "function-call") {
      // This shouldn't happen as function calls should be handled internally
      // But if it does, fall back
      this.logger.warn("Unexpected function-call result in guardrail check");
      return { type: "fallback", response: this.buildFallbackResponse(triage, citations) };
    }

    if (llmResult.type !== "success" || !llmResult.text) {
      this.logger.warn("LLM unavailable, returning fallback", {
        reason: llmResult.type,
        breaker: this.llmClient.getBreakerState(),
      });
      const fallbackNotes = llmResult.type === "circuit-open" ? ["Language model unavailable"] : undefined;
      return { type: "fallback", response: this.buildFallbackResponse(triage, citations, fallbackNotes) };
    }

    // Defer non-critical checking to GuardrailService in the success path
    return { type: "success", text: llmResult.text };
  }

  private getLatestUserMessage(messages: ChatMessage[]): string {
    return messages.slice().reverse().find((message) => message.role === "user")?.content ?? "";
  }

  private buildFallbackAndAudit(args: { latestUser: string; triage: TriageResult; citations: ChatResponse["citations"]; userId?: string; sessionId?: string; ipAddress?: string; userAgent?: string; durationMs: number; notes?: string[] }): ChatResponse {
    const { latestUser, triage, citations, userId, sessionId, ipAddress, userAgent, durationMs, notes } = args;
    void auditLogger.logProtocolQuery({
      userId,
      sessionId,
      query: latestUser,
      protocolsReferenced: triage.matchedProtocols.slice(0, 3).map((p) => `${p.tp_code} - ${p.tp_name}`),
      outcome: "failure",
      ipAddress,
      userAgent,
      durationMs,
      errorMessage: "Guardrail fallback triggered",
    });
    return this.buildFallbackResponse(triage, citations, notes);
  }

  /**
   * Create function call handler for protocol retrieval tools
   */
  private createFunctionCallHandler(sessionId?: string): FunctionCallHandler {
    return async (name: string, args: unknown): Promise<unknown> => {
      const startTime = Date.now();
      metrics.inc("protocol.tool.calls.total");
      metrics.inc(`protocol.tool.calls.by_name.${name}`);

      try {
        const result = await this.dispatchFunctionCall(name, args);
        this.recordToolMetrics(startTime, result);
        if (sessionId) {
          functionCallRateLimiter.recordCall(sessionId, name);
        }
        return result;
      } catch (error) {
        metrics.inc("protocol.tool.calls.errors");
        this.logger.error("Function call handler error", { name, error });
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };
  }

  /**
   * Dispatch function call to appropriate protocol retrieval service method
   */
  private async dispatchFunctionCall(name: string, args: unknown): Promise<unknown> {
    switch (name) {
      case "search_protocols_by_patient_description":
        return this.handlePatientDescriptionSearch(args);
      case "search_protocols_by_call_type":
        return this.handleCallTypeSearch(args);
      case "search_protocols_by_chief_complaint":
        return this.handleChiefComplaintSearch(args);
      case "get_protocol_by_code":
        return this.handleProtocolByCode(args);
      case "get_provider_impressions":
        return this.handleProviderImpressions(args);
      default:
        metrics.inc("protocol.tool.calls.errors");
        return { error: `Unknown function: ${name}` };
    }
  }

  /**
   * Handle patient description search
   */
  private async handlePatientDescriptionSearch(args: unknown): Promise<unknown> {
    const params = args as {
      age?: number;
      sex?: "male" | "female" | "unknown";
      chiefComplaint: string;
      symptoms?: string[];
      vitals?: Record<string, number>;
      allergies?: string[];
      medications?: string[];
      weightKg?: number;
    };
    return this.protocolRetrievalService.searchByPatientDescription(params);
  }

  /**
   * Handle call type search
   */
  private async handleCallTypeSearch(args: unknown): Promise<unknown> {
    const params = args as { dispatchCode?: string; callType?: string };
    return this.protocolRetrievalService.searchByCallType(params);
  }

  /**
   * Handle chief complaint search
   */
  private async handleChiefComplaintSearch(args: unknown): Promise<unknown> {
    const params = args as {
      chiefComplaint: string;
      painLocation?: string;
      severity?: "mild" | "moderate" | "severe" | "critical";
    };
    return this.protocolRetrievalService.searchByChiefComplaint(params);
  }

  /**
   * Handle protocol by code lookup
   */
  private async handleProtocolByCode(args: unknown): Promise<unknown> {
    const params = args as { tpCode: string; includePediatric?: boolean };
    return this.protocolRetrievalService.getProtocolByCode(params);
  }

  /**
   * Handle provider impressions lookup
   */
  private async handleProviderImpressions(args: unknown): Promise<unknown> {
    const params = args as { symptoms: string[]; keywords?: string[] };
    return this.protocolRetrievalService.getProviderImpressions(params);
  }

  /**
   * Record metrics for tool call results
   */
  private recordToolMetrics(startTime: number, result: unknown): void {
    const latencyMs = Date.now() - startTime;
    metrics.observe("protocol.tool.latency_ms", latencyMs);

    if (result && typeof result === "object" && "protocols" in result) {
      const protocols = (result as { protocols: unknown[] }).protocols;
      metrics.observe("protocol.matches.count", protocols.length);
      if (protocols.length > 0 && "score" in protocols[0]) {
        metrics.observe("protocol.matches.score", (protocols[0] as { score: number }).score);
      }
    }
  }

  private buildFallbackResponse(triage: TriageResult, citations: ChatResponse["citations"], notes?: string[]): ChatResponse {
    this.logger.info("Returning fallback response", {
      notes,
      citationCount: citations.length,
    });
    return {
      text: "I can only provide guidance backed by the LA County Prehospital Care Manual. Please ask using protocol names/numbers or relevant LA County terms.",
      citations,
      triage,
      guardrailNotes: notes,
      fallback: true,
    };
  }
}
