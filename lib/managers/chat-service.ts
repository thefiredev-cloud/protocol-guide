import type { ChatMessage } from "@/app/types/chat";
import { createLogger } from "@/lib/log";
import type { CarePlan } from "@/lib/managers/CarePlanManager";
import { CarePlanManager } from "@/lib/managers/CarePlanManager";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { GuardrailManager } from "@/lib/managers/GuardrailManager";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";
import { LLMClient } from "@/lib/managers/llm-client";
import { metrics } from "@/lib/managers/metrics-manager";
import type { NarrativeInput } from "@/lib/managers/NarrativeManager";
import { NarrativeManager } from "@/lib/managers/NarrativeManager";
import { ResearchManager } from "@/lib/managers/ResearchManager";
import { RetrievalManager } from "@/lib/managers/RetrievalManager";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import type { KBDoc } from "@/lib/retrieval";
import { initializeKnowledgeBase } from "@/lib/retrieval";
import type { TriageResult } from "@/lib/triage";
import { buildSearchAugmentation, buildTriageContext, triageInput } from "@/lib/triage";

type ChatMode = "chat" | "narrative" | undefined;

export type ChatRequest = {
  messages: ChatMessage[];
  mode?: ChatMode;
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
  private readonly env = EnvironmentManager.load();
  private readonly guardrails = new GuardrailManager();
  private readonly retrieval = new RetrievalManager();
  private readonly carePlanManager = new CarePlanManager();
  private readonly narrativeManager = new NarrativeManager();
  private readonly researchManager = new ResearchManager();
  private readonly logger = createLogger("ChatService");
  private readonly llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient ?? new LLMClient({
      baseUrl: this.env.llmBaseUrl,
      apiKey: this.env.LLM_API_KEY,
      maxRetries: 2,
      timeoutMs: 12_000,
    });
  }

  public async warm(): Promise<void> {
    await knowledgeBaseInitializer.warm();
    await initializeKnowledgeBase();
  }

  public async handle({ messages, mode }: ChatRequest): Promise<ChatResponse> {
    await this.warm();
    metrics.inc("chat.sessions");

    const latestUser = this.getLatestUserMessage(messages);
    const triage = this.buildTriage(latestUser);
    const retrieval = await this.retrieveKnowledge(latestUser, triage);
    const payload = this.buildPayload(retrieval.context, buildTriageContext(triage), messages);

    const llmStart = Date.now();
    const llmResult = await this.llmClient.sendChat(payload);
    metrics.observe("llm.roundtripMs", Date.now() - llmStart);
    const citations = this.buildCitations(retrieval.hits, triage);
    const guardrailOutcome = this.guardrailManagerCheck(llmResult, triage, citations);
    if (guardrailOutcome.type === "fallback") return guardrailOutcome.response;

    const guardrail = this.guardrails.evaluate(guardrailOutcome.text);
    if (guardrail.corrections.length) {
      const corrected = applyCorrections(guardrailOutcome.text, guardrail.corrections);
      guardrailOutcome.text = corrected;
      guardrail.notes.push("Medication doses adjusted to match PCM guidelines.");
    }

    if (mode === "narrative") {
      return this.buildNarrativeResponse(guardrailOutcome.text, triage, citations, guardrail.notes);
    }

    this.logger.info("Chat succeeded", {
      citationCount: citations.length,
      protocols: triage.matchedProtocols.map((protocol) => protocol.tp_code).slice(0, 3),
    });
    metrics.inc("chat.success");

    return {
      text: guardrailOutcome.text,
      citations,
      triage,
      guardrailNotes: [...guardrail.notes, ...guardrail.dosingIssues],
    };
  }

  private buildTriage(latestUser: string): TriageResult {
    const triage = triageInput(latestUser);
    this.applyProtocolOverride(latestUser, triage);
    return triage;
  }

  private async retrieveKnowledge(latestUser: string, triage: TriageResult) {
    const searchAugmentation = buildSearchAugmentation(triage);
    const combinedQuery = [latestUser, searchAugmentation].filter(Boolean).join(" ").trim() || latestUser;
    return this.retrieval.search({ rawText: combinedQuery, maxChunks: 6 });
  }

  private buildPayload(context: string, intake: string, messages: ChatMessage[]) {
    return {
      model: this.env.llmModel,
      temperature: 0.2,
      messages: this.buildMessages(context, intake, messages),
    } as const;
  }

  private guardrailManagerCheck(
    llmResult: Awaited<ReturnType<LLMClient["sendChat"]>>,
    triage: TriageResult,
    citations: ChatResponse["citations"],
  ): { type: "fallback"; response: ChatResponse } | { type: "success"; text: string } {
    if (llmResult.type !== "success" || !llmResult.text) {
      this.logger.warn("LLM unavailable, returning fallback", {
        reason: llmResult.type,
        breaker: this.llmClient.getBreakerState(),
      });
      const fallbackNotes = llmResult.type === "circuit-open" ? ["Language model unavailable"] : undefined;
      return { type: "fallback", response: this.buildFallbackResponse(triage, citations, fallbackNotes) };
    }

    const guardrail = this.guardrails.evaluate(llmResult.text);
    // Relaxed: only block on critical safety violations
    const criticalViolation = guardrail.containsUnauthorizedMed || guardrail.sceneSafetyConcern;
    if (criticalViolation) {
      this.logger.warn("Critical guardrail violation detected", guardrail);
      return { type: "fallback", response: this.buildFallbackResponse(triage, citations, guardrail.notes) };
    }

    return { type: "success", text: llmResult.text };
  }

  private getLatestUserMessage(messages: ChatMessage[]): string {
    return messages.slice().reverse().find((message) => message.role === "user")?.content ?? "";
  }

  private buildMessages(context: string, intake: string, messages: ChatMessage[]) {
    return [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "system" as const, content: `INTAKE:\n${intake}` },
      { role: "system" as const, content: `CONTEXT:\n${context}` },
      ...messages,
    ];
  }

  private applyProtocolOverride(text: string, triage: TriageResult): void {
    const match = text.match(/\bprotocol\s*[:\-]\s*(\d{4}(?:\.\d)?)\b/i);
    if (!match) return;
    const code = match[1];
    const index = triage.matchedProtocols.findIndex(
      (protocol) => protocol.tp_code === code || protocol.tp_code_pediatric === code,
    );
    if (index < 0) return;
    const chosen = triage.matchedProtocols[index];
    triage.matchedProtocols = [
      chosen,
      ...triage.matchedProtocols.filter((protocol, currentIndex) => currentIndex !== index),
    ];
  }

  private buildCitations(hits: KBDoc[], triage: TriageResult) {
    const preferred = this.prioritizeProtocolHits(hits, triage.matchedProtocols?.[0]?.tp_code);
    return preferred.reduce<Array<{ title: string; category: string; subcategory?: string }>>((accumulated, doc) => {
      if (accumulated.length >= 4 || accumulated.some((citation) => citation.title === doc.title)) {
        return accumulated;
      }
      return [...accumulated, { title: doc.title, category: doc.category, subcategory: doc.subcategory }];
    }, []);
  }

  private prioritizeProtocolHits(hits: KBDoc[], bestCode?: string): KBDoc[] {
    if (!bestCode) return hits;
    const regex = new RegExp(`\\b${bestCode}\\b`);
    const preferred = hits.filter((hit) => regex.test(hit.title));
    const others = hits.filter((hit) => !regex.test(hit.title));
    return [...preferred, ...others];
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

  private async buildNarrativeResponse(
    text: string,
    triage: TriageResult,
    citations: ChatResponse["citations"],
    notes: string[] = [],
  ): Promise<ChatResponse> {
    const carePlan = this.carePlanManager.build(triage);
    const baseInput = this.buildNarrativeInput(triage, carePlan);
    const soap = this.narrativeManager.buildSOAP(baseInput);
    const chronological = this.narrativeManager.buildChronological(baseInput);
    const nemsis = this.narrativeManager.buildNemsis(baseInput);
    const research = await this.researchManager.search();

    return {
      text,
      citations,
      carePlan,
      narrative: {
        soap,
        chronological,
        nemsis,
      },
      triage,
      research,
      guardrailNotes: notes,
    };
  }

  private buildNarrativeInput(triage: TriageResult, carePlan: CarePlan | null): NarrativeInput {
    const vitalsLine = this.formatVitalsLine(triage);

    return {
      demographics: this.buildDemographics(triage),
      chiefComplaint: triage.chiefComplaint
        ? `${triage.chiefComplaint}${triage.painLocation ? ` (${triage.painLocation})` : ""}`
        : undefined,
      vitals: vitalsLine ? [vitalsLine] : undefined,
      interventions: this.buildInterventions(carePlan),
      history: this.buildHistory(triage),
      assessment: this.buildAssessment(triage),
      baseContact: carePlan?.baseContact,
    };
  }

  private formatVitalsLine(triage: TriageResult): string | undefined {
    const vitals = triage.vitals;
    if (!vitals) return undefined;

    const vitalParts = [
      this.formatBloodPressure(vitals),
      this.formatNumericVital("HR", vitals.heartRate),
      this.formatNumericVital("RR", vitals.respiratoryRate),
      this.formatSaturation(vitals.spo2),
      this.formatTemperature(vitals.temperatureF, "F"),
      this.formatTemperature(vitals.temperatureC, "C"),
      this.formatNumericVital("Glucose", vitals.glucose),
      this.formatNumericVital("GCS", vitals.gcs),
    ].filter(Boolean);

    return vitalParts.length ? vitalParts.join(", ") : undefined;
  }

  private formatBloodPressure(vitals: NonNullable<TriageResult["vitals"]>): string | undefined {
    if (vitals.systolic === undefined || vitals.diastolic === undefined) return undefined;
    return `BP ${vitals.systolic}/${vitals.diastolic}`;
  }

  private formatNumericVital(label: string, value: number | undefined): string | undefined {
    if (value === undefined) return undefined;
    return `${label} ${value}`;
  }

  private formatSaturation(value: number | undefined): string | undefined {
    if (value === undefined) return undefined;
    return `SpO2 ${value}%`;
  }

  private formatTemperature(value: number | undefined, unit: "F" | "C"): string | undefined {
    if (value === undefined) return undefined;
    return `Temp ${value}${unit}`;
  }

  private buildDemographics(triage: TriageResult): string[] | undefined {
    const items: string[] = [];
    if (triage.age) items.push(`${triage.age}y`);
    if (triage.sex && triage.sex !== "unknown") items.push(triage.sex);
    if (triage.pregnant) items.push("pregnant");
    if (triage.chiefComplaint) items.push(triage.chiefComplaint + (triage.painLocation ? ` (${triage.painLocation})` : ""));
    return items.length ? items : undefined;
  }

  private buildHistory(triage: TriageResult): string[] | undefined {
    const items: string[] = [];
    if (triage.allergies?.length) items.push(`Allergies: ${triage.allergies.join(", ")}`);
    if (triage.medications?.length) items.push(`Meds: ${triage.medications.join(", ")}`);
    return items.length ? items : undefined;
  }

  private buildInterventions(carePlan: CarePlan | null): string[] | undefined {
    if (!carePlan) return undefined;
    const items: string[] = [];
    items.push(`Protocol ${carePlan.protocolCode} – ${carePlan.protocolTitle}`);
    items.push(...carePlan.actions.map((action) => `Action: ${action}`));
    items.push(...carePlan.basicMedications.map((med) => `Medication plan: ${med}`));
    carePlan.criticalNotes.forEach((note) => items.push(`Critical note: ${note}`));
    return items.length ? items : undefined;
  }

  private buildAssessment(triage: TriageResult): string[] | undefined {
    const items: string[] = [];
    const best = triage.matchedProtocols?.[0];
    if (best) items.push(`Working impression: ${best.pi_name} (${best.pi_code})`);
    if (triage.matchedProtocols?.length) {
      const diffs = triage.matchedProtocols
        .slice(0, 3)
        .map((protocol) => `${protocol.tp_name} ${protocol.tp_code}`)
        .join(", ");
      items.push(`Differential/protocol candidates: ${diffs}`);
    }
    return items.length ? items : undefined;
  }
}

function applyCorrections(text: string, corrections: Array<{ original: string; replacement: string }>): string {
  let updated = text;
  for (const correction of corrections) {
    updated = updated.replace(correction.original, correction.replacement);
  }
  return updated;
}

