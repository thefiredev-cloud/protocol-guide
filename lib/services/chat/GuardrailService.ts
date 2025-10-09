import { GuardrailManager } from "@/lib/managers/GuardrailManager";

export type GuardrailCheckOutcome =
  | { type: "fallback"; notes?: string[]; dosingIssues?: string[] }
  | { type: "success"; text: string; notes: string[]; dosingIssues: string[] };

export class GuardrailService {
  private readonly manager = new GuardrailManager();

  public evaluate(textOrNull: string | null): GuardrailCheckOutcome {
    if (!textOrNull) return { type: "fallback", notes: ["Language model unavailable"] };

    const result = this.manager.evaluate(textOrNull);
    const criticalViolation = result.containsUnauthorizedMed || result.sceneSafetyConcern;
    if (criticalViolation) {
      return { type: "fallback", notes: result.notes, dosingIssues: result.dosingIssues };
    }
    return { type: "success", text: textOrNull, notes: result.notes, dosingIssues: result.dosingIssues };
  }
}


