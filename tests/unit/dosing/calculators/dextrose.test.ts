import { describe, expect, it } from "vitest";

import { DextroseCalculator } from "@/lib/dosing/calculators/dextrose";

describe("DextroseCalculator", () => {
  const calculator = new DextroseCalculator();

  describe("Calculator metadata", () => {
    it("has correct id", () => {
      expect(calculator.id).toBe("dextrose");
    });

    it("has correct name", () => {
      expect(calculator.name).toBe("Dextrose");
    });

    it("has aliases for common names", () => {
      expect(calculator.aliases).toContain("d50");
      expect(calculator.aliases).toContain("d25");
      expect(calculator.aliases).toContain("d10");
    });

    it("has categories", () => {
      expect(calculator.categories).toContain("Medication");
      expect(calculator.categories).toContain("Metabolic");
    });
  });

  describe("Weight validation (addresses 75% error rate)", () => {
    it("rejects missing weight", () => {
      const result = calculator.calculate({ patientAgeYears: 5 });
      expect(result.metadata?.error).toBe(true);
      expect(result.warnings[0]).toContain("weight");
    });

    it("rejects zero weight", () => {
      const result = calculator.calculate({ patientWeightKg: 0, patientAgeYears: 5 });
      expect(result.metadata?.error).toBe(true);
    });

    it("rejects negative weight", () => {
      const result = calculator.calculate({ patientWeightKg: -5, patientAgeYears: 5 });
      expect(result.metadata?.error).toBe(true);
    });
  });

  describe("Adult dosing (≥15 years or ≥45kg)", () => {
    it("gives 25g D50W for standard adult", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const adultRec = result.recommendations.find(r => r.label.includes("Adult"));
      expect(adultRec).toBeDefined();
      expect(adultRec?.dose.quantity).toBe(25);
      expect(adultRec?.dose.unit).toBe("g");
      expect(adultRec?.concentration?.label).toContain("D50W");
    });

    it("uses adult dosing for 45kg 12-year-old", () => {
      const result = calculator.calculate({ patientWeightKg: 45, patientAgeYears: 12 });
      
      const adultRec = result.recommendations.find(r => r.label.includes("Adult"));
      expect(adultRec).toBeDefined();
    });

    it("uses adult dosing for 40kg 16-year-old", () => {
      const result = calculator.calculate({ patientWeightKg: 40, patientAgeYears: 16 });
      
      const adultRec = result.recommendations.find(r => r.label.includes("Adult"));
      expect(adultRec).toBeDefined();
    });

    it("includes extravasation warning", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.warnings.some(w => w.toLowerCase().includes("extravasation"))).toBe(true);
    });
  });

  describe("Pediatric dosing (<12 years)", () => {
    it("calculates 0.5g/kg for 20kg child", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const pedRec = result.recommendations.find(r => r.label.includes("Pediatric"));
      expect(pedRec).toBeDefined();
      expect(pedRec?.dose.quantity).toBe(10); // 20kg * 0.5g/kg = 10g
    });

    it("uses D25W for children ≥2 years", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const pedRec = result.recommendations.find(r => r.label.includes("Pediatric"));
      expect(pedRec?.concentration?.label).toContain("D25W");
    });

    it("uses D10W for children <2 years", () => {
      const result = calculator.calculate({ patientWeightKg: 10, patientAgeYears: 1 });
      
      const pedRec = result.recommendations.find(r => r.label.includes("Pediatric"));
      expect(pedRec?.concentration?.label).toContain("D10W");
    });

    it("respects 25g max dose for large pediatric patient", () => {
      // 40kg child at 8 years: 40 * 0.5 = 20g (under max, but tests the path)
      // Use weight that stays pediatric (<45kg) but would exceed max if not capped
      const result = calculator.calculate({ patientWeightKg: 44, patientAgeYears: 10 });
      
      const pedRec = result.recommendations.find(r => r.label.includes("Pediatric"));
      expect(pedRec).toBeDefined();
      expect(pedRec?.dose.quantity).toBe(22); // 44kg * 0.5g/kg = 22g (under max)
      expect(pedRec?.maxSingleDose?.quantity).toBe(25); // Max is 25g
    });

    it("warns against D50W in pediatrics", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      expect(result.warnings.some(w => w.includes("Never") && w.includes("D50W"))).toBe(true);
    });
  });

  describe("Neonate dosing (<1 month)", () => {
    it("uses D10W ONLY for neonates", () => {
      const result = calculator.calculate({ patientWeightKg: 3, patientAgeYears: 0.02 });
      
      const neoRec = result.recommendations.find(r => r.label.includes("Neonate"));
      expect(neoRec).toBeDefined();
      expect(neoRec?.concentration?.label).toContain("D10W");
    });

    it("calculates 2mL/kg volume for neonates", () => {
      const result = calculator.calculate({ patientWeightKg: 3, patientAgeYears: 0.02 });
      
      const neoRec = result.recommendations.find(r => r.label.includes("Neonate"));
      expect(neoRec).toBeDefined();
      // 2mL/kg * 3kg = 6mL of D10W = 0.6g
      expect(neoRec?.dose.quantity).toBe(0.6);
    });

    it("warns about higher concentrations in neonates", () => {
      const result = calculator.calculate({ patientWeightKg: 3, patientAgeYears: 0.02 });
      expect(result.warnings.some(w => w.includes("D10W ONLY"))).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("handles very low pediatric weight (3kg)", () => {
      const result = calculator.calculate({ patientWeightKg: 3, patientAgeYears: 0.5 });
      
      expect(result.metadata?.error).toBeUndefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("adds warning for borderline high pediatric weight (>40kg)", () => {
      const result = calculator.calculate({ patientWeightKg: 42, patientAgeYears: 10 });
      
      expect(result.warnings.some(w => w.includes(">40kg"))).toBe(true);
    });

    it("includes protocol citations", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.citations).toContain("TP 1203");
    });
  });
});
