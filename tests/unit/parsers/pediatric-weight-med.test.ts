import { describe, it, expect } from "vitest";
import { extractPediatricWeightMedQueries } from "@/lib/parsers/pediatric-weight-med";

describe("extractPediatricWeightMedQueries", () => {
  it("extracts weight and atropine med from '5kg kid atropine'", () => {
    const queries = extractPediatricWeightMedQueries("5kg kid atropine");
    expect(queries.length).toBeGreaterThan(0);
    const match = queries.find(q => q.medicationKey === "atropine");
    expect(match).toBeTruthy();
    expect(match?.weightKg).toBe(5);
  });

  it("extracts D10 from 'give d10 for 6 kg'", () => {
    const queries = extractPediatricWeightMedQueries("give d10 for 6 kg");
    const match = queries.find(q => q.medicationKey === "d10");
    expect(match).toBeTruthy();
    expect(match?.weightKg).toBe(6);
  });

  it("extracts push-dose epi from 'push dose epi for 12 kg'", () => {
    const queries = extractPediatricWeightMedQueries("push dose epi for 12 kg");
    const match = queries.find(q => q.medicationKey === "epinephrine_push");
    expect(match).toBeTruthy();
    expect(match?.weightKg).toBe(12);
  });
});


