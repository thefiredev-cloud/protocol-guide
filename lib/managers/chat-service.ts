import type { ChatMessage } from "@/app/types/chat";
import { auditLogger } from "@/lib/audit/audit-logger";
import { createLogger } from "@/lib/log";
import type { CarePlan } from "@/lib/managers/CarePlanManager";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";
import { LLMClient } from "@/lib/managers/llm-client";
import { metrics } from "@/lib/managers/metrics-manager";
import { RetrievalManager } from "@/lib/managers/RetrievalManager";
import { initializeKnowledgeBase } from "@/lib/retrieval";
import { ChatProfiler } from "@/lib/services/chat/chat-profiler";
import { CitationService } from "@/lib/services/chat/citation-service";
import { GuardrailService } from "@/lib/services/chat/guardrail-service";
import { NarrativeResponseBuilder } from "@/lib/services/chat/narrative-response-builder";
import { PayloadBuilder } from "@/lib/services/chat/payload-builder";
import { ProtocolRetrievalService } from "@/lib/services/chat/protocol-retrieval-service";
import { ProtocolToolManager } from "@/lib/services/chat/protocol-tool-manager";
import { TriageService } from "@/lib/services/chat/triage-service";
import { functionCallRateLimiter } from "@/lib/services/chat/function-call-rate-limiter";
import type { TriageResult } from "@/lib/triage";
import type { FunctionCallHandler } from "@/lib/managers/llm-client";

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

  public async handle({ messages, mode, userId, sessionId, ipAddress, userAgent }: ChatRequest): Promise<ChatResponse> {
    await this.warm();
    metrics.inc("chat.sessions");
    const profiler = new ChatProfiler();

    const latestUser = this.getLatestUserMessage(messages);
    profiler.markStart("triage");
    const triage = this.triageService.build(latestUser);
    profiler.markEnd("triage");
    profiler.markStart("retrieval");
    const searchQuery = this.triageService.buildSearchQuery(latestUser, triage);
    const retrieval = await this.retrieval.search({ rawText: searchQuery, maxChunks: 6 });
    profiler.markEnd("retrieval");
    profiler.markStart("payload");
    const intake = this.triageService.buildIntake(triage);
    
    // Get protocol retrieval tools
    const tools = ProtocolToolManager.getTools();
    const payload = this.payloadBuilder.build(retrieval.context, intake, messages, tools);
    profiler.markEnd("payload");

    profiler.markStart("llm");
    // Create function call handler with rate limiting
    const functionCallHandler = this.createFunctionCallHandler(sessionId);
    const rateLimiter = (sid: string) => functionCallRateLimiter.check(sid);
    const llmResult = await this.llmClient.sendChat(payload, functionCallHandler, sessionId, rateLimiter);
    profiler.markEnd("llm");
    const durationMs = 0; // recorded via profiler histogram
    metrics.observe("llm.roundtripMs", durationMs);
    const citations = this.citationService.build(retrieval.hits, triage);
    profiler.markStart("guardrail");
    const guardrailOutcome = this.guardrailManagerCheck(llmResult, triage, citations);
    profiler.markEnd("guardrail");

    // Extract protocol references for audit log
    const protocolsReferenced = triage.matchedProtocols
      .slice(0, 3)
      .map((p) => `${p.tp_code} - ${p.tp_name}`);

    if (guardrailOutcome.type === "fallback") {
      // Log failed/fallback protocol query
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
      return guardrailOutcome.response;
    }

    // Apply non-critical corrections while preserving notes
    const evaluated = this.guardrailService.evaluate(guardrailOutcome.type === "success" ? guardrailOutcome.text : null);
    if (evaluated.type === "fallback") {
      return this.buildFallbackAndAudit({ latestUser, triage, citations, userId, sessionId, ipAddress, userAgent, durationMs, notes: evaluated.notes });
    }
    const text = evaluated.text;
    const notes = [...evaluated.notes, ...(evaluated.dosingIssues ?? [])];

    // Log successful protocol query
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
        switch (name) {
          case "search_protocols_by_patient_description": {
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
            const result = await this.protocolRetrievalService.searchByPatientDescription(params);
            const latencyMs = Date.now() - startTime;
            metrics.observe("protocol.tool.latency_ms", latencyMs);
            metrics.observe("protocol.matches.count", result.protocols.length);
            if (result.protocols.length > 0) {
              metrics.observe("protocol.matches.score", result.protocols[0].score);
            }
            if (sessionId) {
              functionCallRateLimiter.recordCall(sessionId, name);
            }
            return result;
          }

          case "search_protocols_by_call_type": {
            const params = args as { dispatchCode?: string; callType?: string };
            const result = await this.protocolRetrievalService.searchByCallType(params);
            const latencyMs = Date.now() - startTime;
            metrics.observe("protocol.tool.latency_ms", latencyMs);
            metrics.observe("protocol.matches.count", result.protocols.length);
            if (result.protocols.length > 0) {
              metrics.observe("protocol.matches.score", result.protocols[0].score);
            }
            if (sessionId) {
              functionCallRateLimiter.recordCall(sessionId, name);
            }
            return result;
          }

          case "search_protocols_by_chief_complaint": {
            const params = args as {
              chiefComplaint: string;
              painLocation?: string;
              severity?: "mild" | "moderate" | "severe" | "critical";
            };
            const result = await this.protocolRetrievalService.searchByChiefComplaint(params);
            const latencyMs = Date.now() - startTime;
            metrics.observe("protocol.tool.latency_ms", latencyMs);
            metrics.observe("protocol.matches.count", result.protocols.length);
            if (result.protocols.length > 0) {
              metrics.observe("protocol.matches.score", result.protocols[0].score);
            }
            if (sessionId) {
              functionCallRateLimiter.recordCall(sessionId, name);
            }
            return result;
          }

          case "get_protocol_by_code": {
            const params = args as { tpCode: string; includePediatric?: boolean };
            const result = await this.protocolRetrievalService.getProtocolByCode(params);
            const latencyMs = Date.now() - startTime;
            metrics.observe("protocol.tool.latency_ms", latencyMs);
            metrics.observe("protocol.matches.count", result.protocols.length);
            if (result.protocols.length > 0) {
              metrics.observe("protocol.matches.score", result.protocols[0].score);
            }
            if (sessionId) {
              functionCallRateLimiter.recordCall(sessionId, name);
            }
            return result;
          }

          case "get_provider_impressions": {
            const params = args as { symptoms: string[]; keywords?: string[] };
            const result = await this.protocolRetrievalService.getProviderImpressions(params);
            const latencyMs = Date.now() - startTime;
            metrics.observe("protocol.tool.latency_ms", latencyMs);
            metrics.observe("protocol.matches.count", result.protocols.length);
            if (result.protocols.length > 0) {
              metrics.observe("protocol.matches.score", result.protocols[0].score);
            }
            if (sessionId) {
              functionCallRateLimiter.recordCall(sessionId, name);
            }
            return result;
          }

          default:
            metrics.inc("protocol.tool.calls.errors");
            return { error: `Unknown function: ${name}` };
        }
      } catch (error) {
        metrics.inc("protocol.tool.calls.errors");
        this.logger.error("Function call handler error", { name, error });
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };
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
