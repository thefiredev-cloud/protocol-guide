import { metrics } from "@/lib/managers/metrics-manager";

export type ProfiledSection = "triage" | "retrieval" | "payload" | "llm" | "guardrail" | "narrative";

export class ChatProfiler {
  private marks: Record<string, number> = {};

  markStart(section: ProfiledSection): void {
    this.marks[section] = Date.now();
  }

  markEnd(section: ProfiledSection): void {
    const start = this.marks[section];
    if (typeof start === "number") {
      const ms = Date.now() - start;
      metrics.observe(`chat.prof.${section}.ms`, ms);
    }
  }
}


