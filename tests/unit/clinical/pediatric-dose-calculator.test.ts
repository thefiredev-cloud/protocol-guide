import { describe, it, expect } from "vitest";
import { PediatricDoseCalculator } from "@/lib/clinical/pediatric-dose-calculator";

describe("PediatricDoseCalculator", () => {
  it("calculates atropine for 5 kg (0.1 mg, 1 mL)", () => {
    const result = PediatricDoseCalculator.calculate({ medicationKey: "atropine", weightKg: 5 });
    expect(result).toBeTruthy();
    expect(result?.doseMg).toBeCloseTo(0.1, 3);
    expect(result?.doseMl).toBeCloseTo(1.0, 3);
    expect(result?.summaryLine).toMatch(/Grey 5 kg/i);
    expect(result?.summaryLine).toMatch(/Atropine/i);
    expect(result?.summaryLine).toMatch(/0\.1\s*mg\s*\(1\s*mL\)/i);
  });

  it("calculates epinephrine IM for 10 kg (0.1 mg, 0.1 mL)", () => {
    const result = PediatricDoseCalculator.calculate({ medicationKey: "epinephrine_im", weightKg: 10 });
    expect(result).toBeTruthy();
    expect(result?.doseMg).toBeCloseTo(0.1, 3);
    expect(result?.doseMl).toBeCloseTo(0.1, 3);
    expect(result?.summaryLine).toMatch(/Epinephrine IM/i);
  });

  it("calculates D10 5 mL/kg for 7 kg (35 mL)", () => {
    const result = PediatricDoseCalculator.calculate({ medicationKey: "d10", weightKg: 7 });
    expect(result).toBeTruthy();
    expect(result?.doseMl).toBeCloseTo(35, 3);
    expect(result?.summaryLine).toMatch(/Dextrose 10%/i);
  });

  it("calculates Calcium Chloride 20 mg/kg with max 1 g", () => {
    const peds = PediatricDoseCalculator.calculate({ medicationKey: "calcium_chloride", weightKg: 50 });
    expect(peds).toBeTruthy();
    // 20 mg/kg * 50 = 1000 mg (maxed)
    expect(peds?.doseMg).toBe(1000);
  });

  it("calculates Midazolam IV/IO 0.1 mg/kg for 20 kg (2 mg)", () => {
    const result = PediatricDoseCalculator.calculate({ medicationKey: "midazolam_ivio", weightKg: 20 });
    expect(result).toBeTruthy();
    expect(result?.doseMg).toBeCloseTo(2.0, 3);
    expect(result?.doseMl).toBeCloseTo(0.4, 3); // 5 mg/mL → 2 mg is 0.4 mL
  });

  it("calculates Sodium Bicarbonate 1 mEq/kg for 12 kg (12 mEq = 12 mL)", () => {
    const result = PediatricDoseCalculator.calculate({ medicationKey: "sodium_bicarbonate", weightKg: 12 });
    expect(result).toBeTruthy();
    expect(result?.doseMl).toBe(12);
    expect(result?.summaryLine).toMatch(/1\s*mEq\/kg/i);
  });

  it("calculates Normal Saline bolus 20 mL/kg for 9 kg (180 mL)", () => {
    const result = PediatricDoseCalculator.calculate({ medicationKey: "ns_bolus", weightKg: 9 });
    expect(result).toBeTruthy();
    expect(result?.doseMl).toBe(180);
  });
});


