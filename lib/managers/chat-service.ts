import type { ChatMessage } from "../../app/types/chat";
import { auditLogger } from "../../lib/audit/audit-logger";
import { chatHistoryService } from "../../lib/services/chat/chat-history-service";
import {
  BASE_HOSPITALS,
  getAllBaseHospitalsByCapability,
  getBaseHospitalsByRegion,
  MEDICAL_ALERT_CENTER,
  SPECIALIZED_CONTACTS,
} from "../../lib/clinical/base-hospitals";
import type { PatientCondition } from "../../lib/clinical/transport-destinations";
import { facilityIntegration } from "../../lib/services/chat/facility-integration";
import type { Region } from "../../lib/clinical/facilities";
import { createDefaultMedicationManager } from "../../lib/dosing/registry";
import { createLogger } from "../../lib/log";
import type { FunctionCallHandler } from "../../lib/managers/anthropic-client";
import { AnthropicClient } from "../../lib/managers/anthropic-client";
import type { CarePlan } from "../../lib/managers/CarePlanManager";
import { EnvironmentManager } from "../../lib/managers/environment-manager";
import { knowledgeBaseInitializer } from "../../lib/managers/knowledge-base-initializer";
import { LLMClient } from "../../lib/managers/llm-client";
import { metrics } from "../../lib/managers/metrics-manager";
import { RetrievalManager } from "../../lib/managers/RetrievalManager";
import { initializeKnowledgeBase } from "../../lib/retrieval";
import { ChatProfiler } from "../../lib/services/chat/chat-profiler";
import { CitationService } from "../../lib/services/chat/citation-service";
import { functionCallRateLimiter } from "../../lib/services/chat/function-call-rate-limiter";
import { GuardrailService } from "../../lib/services/chat/guardrail-service";
import { PayloadBuilder } from "../../lib/services/chat/payload-builder";
import { ProtocolRetrievalService } from "../../lib/services/chat/protocol-retrieval-service";
import { ProtocolToolManager } from "../../lib/services/chat/protocol-tool-manager";
import { DrugToolManager } from "../../lib/services/chat/drug-tool-manager";
import { TriageService } from "../../lib/services/chat/triage-service";
import {
  getDrugLookupService,
  formatDrugLookupForFunction,
} from "../../lib/drugs/services/drug-lookup-service";
import {
  getDrugInteractionChecker,
  formatInteractionsForFunction,
} from "../../lib/drugs/services/drug-interaction-checker";
import {
  getDrugIdentificationService,
  formatIdentificationForFunction,
} from "../../lib/drugs/services/drug-identification-service";
import type { TriageResult } from "../../lib/triage";

type ChatMode = "chat" | "narrative" | undefined;

export type ChatRequest = {
  messages: ChatMessage[];
  mode?: ChatMode;
  userId?: string;
  sessionId?: string;
  /** Chat session ID for persistence (different from request sessionId) */
  chatSessionId?: string;
  /** Device fingerprint for anonymous users */
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  /** Provider level for scope of practice (default: Paramedic) */
  providerLevel?: "EMT" | "Paramedic";
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
  private readonly llmClient: LLMClient | AnthropicClient;
  private readonly triageService: TriageService;
  private readonly payloadBuilder: PayloadBuilder;
  private readonly citationService: CitationService;
  private readonly guardrailService: GuardrailService;
  private readonly protocolRetrievalService = new ProtocolRetrievalService();
  private readonly medicationManager = createDefaultMedicationManager();
  /** Current provider level for scope enforcement (set per request) */
  private currentProviderLevel: "EMT" | "Paramedic" = "Paramedic";

  constructor(llmClient?: LLMClient | AnthropicClient) {
    // Select client based on provider configuration (default: OpenAI/GPT-4o-mini)
    this.llmClient = llmClient ?? this.createLLMClient();
    this.triageService = new TriageService();
    this.payloadBuilder = new PayloadBuilder(this.env.llmModel, 0.2);
    this.citationService = new CitationService();
    this.guardrailService = new GuardrailService();
  }

  /**
   * Create LLM client based on provider configuration
   * Defaults to Anthropic/Claude for better medical reasoning
   */
  private createLLMClient(): LLMClient | AnthropicClient {
    const isAnthropic = this.env.llmProvider === "anthropic" ||
      this.env.llmBaseUrl.includes("anthropic.com");

    if (isAnthropic) {
      this.logger.info("Using Anthropic/Claude API", { model: this.env.llmModel });
      return new AnthropicClient({
        baseUrl: this.env.llmBaseUrl,
        apiKey: this.env.LLM_API_KEY,
        maxRetries: 2,
        timeoutMs: 30_000, // Claude needs more time
        fetchImpl: (globalThis as unknown as { fetch: typeof fetch }).fetch,
      });
    }

    this.logger.info("Using OpenAI-compatible API", { model: this.env.llmModel });
    return new LLMClient({
      baseUrl: this.env.llmBaseUrl,
      apiKey: this.env.LLM_API_KEY,
      maxRetries: 2,
      timeoutMs: 12_000,
      fetchImpl: (globalThis as unknown as { fetch: typeof fetch }).fetch,
    });
  }

  public async warm(): Promise<void> {
    await knowledgeBaseInitializer.warm();
    // Ensure retrieval index is loaded even if warm() is mocked in tests
    await initializeKnowledgeBase();
  }

  /**
   * Handle chat request - main entry point
   */
  public async handle({ messages, mode, userId, sessionId, chatSessionId, deviceFingerprint, ipAddress, userAgent, providerLevel }: ChatRequest): Promise<ChatResponse> {
    // Set provider level for this request (default: Paramedic)
    this.currentProviderLevel = providerLevel ?? "Paramedic";

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
      chatSessionId,
      deviceFingerprint,
      providerLevel: this.currentProviderLevel,
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
    const tools = [...ProtocolToolManager.getTools(), ...DrugToolManager.getTools()];
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
    chatSessionId?: string;
    deviceFingerprint?: string;
    providerLevel?: "EMT" | "Paramedic";
    ipAddress?: string;
    userAgent?: string;
    durationMs: number;
    profiler: ChatProfiler;
  }): Promise<ChatResponse> {
    const { llmResult, triage, citations, latestUser, mode, userId, sessionId, chatSessionId, deviceFingerprint, providerLevel, ipAddress, userAgent, durationMs, profiler } = args;

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

    return this.buildSuccessResponse({ evaluated, triage, citations, mode, latestUser, protocolsReferenced, userId, sessionId, chatSessionId, deviceFingerprint, providerLevel, ipAddress, userAgent, durationMs, profiler });
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
   * Build success response with audit logging and chat persistence
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
    chatSessionId?: string;
    deviceFingerprint?: string;
    providerLevel?: "EMT" | "Paramedic";
    ipAddress?: string;
    userAgent?: string;
    durationMs: number;
    profiler: ChatProfiler;
  }): Promise<ChatResponse> {
    const { evaluated, triage, citations, mode, latestUser, protocolsReferenced, userId, sessionId, chatSessionId, deviceFingerprint, providerLevel, ipAddress, userAgent, durationMs, profiler } = args;

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

    // Persist chat messages (non-blocking)
    this.persistChatMessages({
      chatSessionId,
      userId,
      deviceFingerprint,
      providerLevel,
      userMessage: latestUser,
      assistantResponse: text,
      citations,
      durationMs,
    }).catch((error) => {
      this.logger.error("Failed to persist chat messages", { error });
    });

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

  /**
   * Persist chat messages to database (non-blocking)
   */
  private async persistChatMessages(params: {
    chatSessionId?: string;
    userId?: string;
    deviceFingerprint?: string;
    providerLevel?: "EMT" | "Paramedic";
    userMessage: string;
    assistantResponse: string;
    citations: ChatResponse["citations"];
    durationMs: number;
  }): Promise<void> {
    let sessionId = params.chatSessionId;

    // Create session if not exists
    if (!sessionId) {
      sessionId = await chatHistoryService.createSession({
        userId: params.userId,
        deviceFingerprint: params.deviceFingerprint,
        providerLevel: params.providerLevel,
      }) ?? undefined;
    }

    if (!sessionId) {
      // Database not available
      return;
    }

    // Save user message
    await chatHistoryService.saveMessage({
      sessionId,
      role: "user",
      content: params.userMessage,
    });

    // Save assistant response
    await chatHistoryService.saveMessage({
      sessionId,
      role: "assistant",
      content: params.assistantResponse,
      citations: params.citations,
      responseTimeMs: params.durationMs,
    });
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
      case "calculate_medication_dose":
        return this.handleMedicationDose(args);
      case "get_transport_recommendation":
        return this.handleTransportRecommendation(args);
      case "get_base_hospital_info":
        return this.handleBaseHospitalInfo(args);
      case "get_diversion_status":
        return this.handleDiversionStatus(args);
      case "get_facility_status":
        return this.handleFacilityStatus(args);
      // Drug intelligence functions
      case "lookup_drug_info":
        return this.handleDrugLookup(args);
      case "check_drug_interactions":
        return this.handleDrugInteractions(args);
      case "identify_medication":
        return this.handleDrugIdentification(args);
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
   * Handle medication dose calculation for adult and pediatric patients
   * Includes scope of practice enforcement per LA County Policy 802/803
   */
  private handleMedicationDose(args: unknown): unknown {
    const params = args as {
      medication: string;
      patientAgeYears?: number;
      patientWeightKg?: number;
      scenario?: string;
      route?: string;
    };

    const result = this.medicationManager.calculate(params.medication, {
      patientAgeYears: params.patientAgeYears,
      patientWeightKg: params.patientWeightKg,
      scenario: params.scenario,
      route: params.route,
      providerLevel: this.currentProviderLevel,
    });

    if (!result) {
      const available = this.medicationManager.list().map((c) => c.name);
      return {
        error: `Medication "${params.medication}" not found`,
        availableMedications: available,
      };
    }

    return {
      medication: result.medicationName,
      patientType: (params.patientAgeYears ?? 30) >= 15 ? "adult" : "pediatric",
      weightKg: params.patientWeightKg,
      // Scope of practice enforcement
      scopeAuthorized: result.scopeAuthorized,
      scopeWarning: result.scopeWarning,
      policyReference: result.policyReference,
      recommendations: result.recommendations.map((rec) => ({
        indication: rec.label,
        route: rec.route,
        dose: `${rec.dose.quantity} ${rec.dose.unit}`,
        maxSingleDose: rec.maxSingleDose ? `${rec.maxSingleDose.quantity} ${rec.maxSingleDose.unit}` : undefined,
        maxTotalDose: rec.maxTotalDose ? `${rec.maxTotalDose.quantity} ${rec.maxTotalDose.unit}` : undefined,
        repeat: rec.repeat ? `Every ${rec.repeat.intervalMinutes} min, max ${rec.repeat.maxRepeats ?? "unlimited"} times` : undefined,
        notes: rec.administrationNotes,
      })),
      warnings: result.warnings,
      citations: result.citations,
    };
  }

  /**
   * Handle transport recommendation lookup with diversion awareness.
   */
  private handleTransportRecommendation(args: unknown): unknown {
    const params = args as {
      condition: PatientCondition;
      isPediatric?: boolean;
      patientAge?: number;
      preferredRegion?: Region;
    };

    // Use FacilityIntegrationService for diversion-aware recommendations
    const recommendation = facilityIntegration.getEnhancedTransportRecommendation(
      params.condition,
      params.isPediatric ?? false,
      params.patientAge,
      params.preferredRegion
    );

    return {
      condition: recommendation.condition,
      destinations: recommendation.recommendedDestinations,
      justification: recommendation.justification,
      timeConstraint: recommendation.timeConstraint,
      baseContactRequired: recommendation.baseContactRequired,
      specialConsiderations: recommendation.specialConsiderations,
      // Diversion-aware additions
      facilitiesOnDiversion: recommendation.facilitiesOnDiversion,
      alternateDestinations: recommendation.alternateDestinations,
      diversionWarning: recommendation.diversionWarning,
    };
  }

  /**
   * Handle base hospital information lookup
   */
  private handleBaseHospitalInfo(args: unknown): unknown {
    const params = args as {
      hospitalName?: string;
      region?: "Central" | "North" | "South" | "East" | "West";
      capability?: string;
      listAll?: boolean;
    };

    // List all hospitals
    if (params.listAll) {
      return {
        hospitals: BASE_HOSPITALS.map(h => ({
          name: h.name,
          shortName: h.shortName,
          phone: h.phone,
          region: h.region,
          capabilities: h.capabilities,
        })),
        medicalAlertCenter: MEDICAL_ALERT_CENTER,
        specializedContacts: SPECIALIZED_CONTACTS,
      };
    }

    // Search by hospital name
    if (params.hospitalName) {
      const searchTerm = params.hospitalName.toLowerCase();
      const matches = BASE_HOSPITALS.filter(h =>
        h.name.toLowerCase().includes(searchTerm) ||
        h.shortName.toLowerCase().includes(searchTerm)
      );
      if (matches.length > 0) {
        return {
          hospitals: matches.map(h => ({
            name: h.name,
            shortName: h.shortName,
            phone: h.phone,
            region: h.region,
            address: h.address,
            capabilities: h.capabilities,
          })),
        };
      }
      return { error: `No hospital found matching "${params.hospitalName}"` };
    }

    // Search by region
    if (params.region) {
      const hospitals = getBaseHospitalsByRegion(params.region);
      return {
        region: params.region,
        hospitals: hospitals.map(h => ({
          name: h.name,
          shortName: h.shortName,
          phone: h.phone,
          capabilities: h.capabilities,
        })),
      };
    }

    // Search by capability
    if (params.capability) {
      const hospitals = getAllBaseHospitalsByCapability(params.capability);
      return {
        capability: params.capability,
        hospitals: hospitals.map(h => ({
          name: h.name,
          shortName: h.shortName,
          phone: h.phone,
          region: h.region,
        })),
      };
    }

    // Default: return all hospitals with MAC
    return {
      hospitals: BASE_HOSPITALS.slice(0, 5).map(h => ({
        name: h.name,
        phone: h.phone,
        region: h.region,
      })),
      note: "Use listAll=true for complete list, or filter by hospitalName, region, or capability",
      medicalAlertCenter: MEDICAL_ALERT_CENTER,
    };
  }

  /**
   * Handle diversion status lookup (feature not available)
   */
  private handleDiversionStatus(_args: unknown): unknown {
    return {
      message: "Diversion status tracking is not currently available.",
      activeDiversions: [],
    };
  }

  /**
   * Handle facility status lookup for specialty routing
   */
  private handleFacilityStatus(args: unknown): unknown {
    const params = args as {
      facilityId?: string;
      region?: Region;
      specialty?: "trauma" | "stemi" | "stroke" | "pediatric" | "burn" | "psych";
    };

    // Specialty centers status
    if (params.specialty) {
      let destinations;
      switch (params.specialty) {
        case "stemi":
          destinations = facilityIntegration.getSTEMIDestinations();
          break;
        case "stroke":
          destinations = facilityIntegration.getStrokeDestinations();
          break;
        case "trauma":
          destinations = facilityIntegration.getTraumaDestinations();
          break;
        default:
          return { error: `Specialty ${params.specialty} status not available` };
      }

      return {
        specialty: params.specialty,
        availableCount: destinations.available.length,
        available: destinations.available.map(f => ({
          id: f.id,
          name: f.name,
          region: f.region,
        })),
      };
    }

    // Basic facility lookup
    if (params.facilityId) {
      return {
        facilityId: params.facilityId,
        isAcceptingPatients: true,
        note: "Real-time status tracking not available",
      };
    }

    return {
      note: "Provide facilityId or specialty to get facility status",
    };
  }

  // ===========================================================================
  // DRUG INTELLIGENCE HANDLERS
  // ===========================================================================

  /**
   * Handle drug lookup by name (brand or generic)
   */
  private async handleDrugLookup(args: unknown): Promise<unknown> {
    const params = args as {
      drugName: string;
      includeInteractions?: boolean;
    };

    try {
      const service = getDrugLookupService();
      const result = await service.lookupDrug(params.drugName);
      return formatDrugLookupForFunction(result);
    } catch (error) {
      this.logger.error("Drug lookup error", { error, drugName: params.drugName });
      return {
        found: false,
        error: "Drug database unavailable. Recommend Base Hospital consult.",
      };
    }
  }

  /**
   * Handle drug interaction check for multiple medications
   */
  private async handleDrugInteractions(args: unknown): Promise<unknown> {
    const params = args as {
      medications: string[];
      includeMinor?: boolean;
    };

    if (!params.medications || params.medications.length < 2) {
      return {
        hasInteractions: false,
        error: "Need at least 2 medications to check for interactions",
      };
    }

    try {
      const checker = getDrugInteractionChecker();
      const result = await checker.checkInteractions(
        params.medications,
        params.includeMinor ?? false
      );
      return formatInteractionsForFunction(result);
    } catch (error) {
      this.logger.error("Drug interaction check error", { error, medications: params.medications });
      return {
        hasInteractions: false,
        error: "Drug interaction database unavailable. Recommend Base Hospital consult for polypharmacy assessment.",
      };
    }
  }

  /**
   * Handle drug identification by appearance/description
   */
  private async handleDrugIdentification(args: unknown): Promise<unknown> {
    const params = args as {
      imprint?: string;
      color?: string;
      shape?: string;
      patientDescription?: string;
    };

    // Need at least one identifying characteristic
    if (!params.imprint && !params.color && !params.shape && !params.patientDescription) {
      return {
        confidence: "none",
        error: "Provide at least one: imprint, color, shape, or patient description of medication use",
      };
    }

    try {
      const service = getDrugIdentificationService();
      const result = await service.identifyDrug({
        imprint: params.imprint,
        color: params.color,
        shape: params.shape,
        patientDescription: params.patientDescription,
      });
      return formatIdentificationForFunction(result);
    } catch (error) {
      this.logger.error("Drug identification error", { error, params });
      return {
        confidence: "none",
        error: "Drug identification unavailable. Consider photo documentation and Base Hospital consult.",
      };
    }
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
      const firstProtocol = protocols[0] as Record<string, unknown> | undefined;
      if (protocols.length > 0 && firstProtocol && "score" in firstProtocol) {
        metrics.observe("protocol.matches.score", (firstProtocol as { score: number }).score);
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
