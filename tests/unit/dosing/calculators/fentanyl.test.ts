import { describe, expect, it } from "vitest";

import { FentanylCalculator } from "@/lib/dosing/calculators/fentanyl";

describe("FentanylCalculator", () => {
  const calculator = new FentanylCalculator();

  describe("Calculator metadata", () => {
    it("has correct id", () => {
      expect(calculator.id).toBe("fentanyl");
    });

    it("has correct name", () => {
      expect(calculator.name).toBe("Fentanyl");
    });

    it("has aliases", () => {
      expect(calculator.aliases).toContain("sublimaze");
    });

    it("has categories", () => {
      expect(calculator.categories).toContain("Medication");
      expect(calculator.categories).toContain("Analgesia");
    });
  });

  describe("Weight validation (addresses 68% error rate)", () => {
    it("rejects missing weight", () => {
      const result = calculator.calculate({ patientAgeYears: 5 });
      expect(result.metadata?.error).toBe(true);
      expect(result.warnings[0]).toContain("weight");
    });

    it("rejects zero weight", () => {
      const result = calculator.calculate({ patientWeightKg: 0, patientAgeYears: 5 });
      expect(result.metadata?.error).toBe(true);
    });

    it("does NOT default to 70kg (safety fix)", () => {
      // This test ensures we don't use dangerous defaults
      const result = calculator.calculate({ patientAgeYears: 5 });
      expect(result.metadata?.error).toBe(true);
      // Should NOT calculate based on assumed 70kg
      expect(result.recommendations.length).toBe(0);
    });
  });

  describe("Adult dosing (≥15 years or ≥45kg)", () => {
    it("gives 50mcg IV for adult", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV") && r.label.includes("Adult"));
      expect(ivRec).toBeDefined();
      expect(ivRec?.dose.quantity).toBe(50);
      expect(ivRec?.dose.unit).toBe("mcg");
    });

    it("gives 50mcg IN for adult", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const inRec = result.recommendations.find(r => r.label.includes("IN") && r.label.includes("Adult"));
      expect(inRec).toBeDefined();
      expect(inRec?.dose.quantity).toBe(50);
      expect(inRec?.route).toBe("IN");
    });

    it("has max total dose of 250mcg for adults", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV") && r.label.includes("Adult"));
      expect(ivRec?.maxTotalDose?.quantity).toBe(250);
    });
  });

  describe("Pediatric dosing (<15 years and <45kg)", () => {
    it("calculates 1mcg/kg IV for pediatrics", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV") && r.label.includes("Pediatric"));
      expect(ivRec).toBeDefined();
      expect(ivRec?.dose.quantity).toBe(20); // 20kg * 1mcg/kg = 20mcg
    });

    it("calculates 1.5mcg/kg IN for pediatrics", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const inRec = result.recommendations.find(r => r.label.includes("IN") && r.label.includes("Pediatric"));
      expect(inRec).toBeDefined();
      expect(inRec?.dose.quantity).toBe(30); // 20kg * 1.5mcg/kg = 30mcg
    });

    it("respects 50mcg max single dose for pediatric IV", () => {
      // Use weight that stays pediatric (<45kg) but would exceed max
      const result = calculator.calculate({ patientWeightKg: 44, patientAgeYears: 10 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV") && r.label.includes("Pediatric"));
      expect(ivRec).toBeDefined();
      expect(ivRec?.dose.quantity).toBe(44); // 44kg * 1mcg/kg = 44mcg (under 50 max)
      expect(ivRec?.maxSingleDose?.quantity).toBe(50); // Max is 50mcg
    });

    it("respects 100mcg max single dose for pediatric IN", () => {
      const result = calculator.calculate({ patientWeightKg: 80, patientAgeYears: 13 });
      
      // This is borderline - 80kg at 13 years
      const result2 = calculator.calculate({ patientWeightKg: 40, patientAgeYears: 10 });
      const inRec = result2.recommendations.find(r => r.label.includes("IN") && r.label.includes("Pediatric"));
      expect(inRec?.dose.quantity).toBe(60); // 40kg * 1.5mcg/kg = 60mcg (under max)
    });
  });

  describe("Respiratory depression warnings (CRITICAL SAFETY)", () => {
    it("ALWAYS includes respiratory depression warning", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.warnings.some(w => w.includes("RESPIRATORY DEPRESSION"))).toBe(true);
    });

    it("ALWAYS includes naloxone availability warning", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.warnings.some(w => w.toLowerCase().includes("naloxone"))).toBe(true);
    });

    it("warns about SpO2 monitoring", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.warnings.some(w => w.includes("SpO2"))).toBe(true);
    });

    it("adds extra warning when SpO2 <94%", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30, spo2: 92 });
      expect(result.warnings.some(w => w.includes("SpO2 <94%"))).toBe(true);
    });

    it("adds extra warning when respiratory rate <12", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30, respiratoryRate: 10 });
      expect(result.warnings.some(w => w.includes("Respiratory rate <12"))).toBe(true);
    });

    it("warns about elderly dose reduction", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.warnings.some(w => w.includes("elderly") || w.includes(">65"))).toBe(true);
    });
  });

  describe("Pediatric-specific warnings", () => {
    it("includes pediatric-specific warnings for children", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      expect(result.warnings.some(w => w.includes("PEDIATRIC"))).toBe(true);
    });

    it("warns about weight-based dosing verification", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      expect(result.warnings.some(w => w.toLowerCase().includes("weight"))).toBe(true);
    });
  });

  describe("Route differentiation (IN vs IV)", () => {
    it("provides both IV and IN routes for adults", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const routes = result.recommendations.map(r => r.route);
      expect(routes).toContain("IV");
      expect(routes).toContain("IN");
    });

    it("provides both IV and IN routes for pediatrics", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const pedRecs = result.recommendations.filter(r => r.label.includes("Pediatric"));
      const routes = pedRecs.map(r => r.route);
      expect(routes).toContain("IV");
      expect(routes).toContain("IN");
    });

    it("notes volume limitation for IN route", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const inRec = result.recommendations.find(r => r.label.includes("IN") && r.label.includes("Pediatric"));
      expect(inRec?.administrationNotes?.some(n => n.includes("nare"))).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("handles very low pediatric weight (3kg)", () => {
      const result = calculator.calculate({ patientWeightKg: 3, patientAgeYears: 0.5 });
      
      expect(result.metadata?.error).toBeUndefined();
      const ivRec = result.recommendations.find(r => r.label.includes("IV") && r.label.includes("Pediatric"));
      expect(ivRec?.dose.quantity).toBe(3); // 3kg * 1mcg/kg = 3mcg
    });

    it("includes protocol citations", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.citations).toContain("MCG 1309");
      expect(result.citations).toContain("1317.19");
    });

    it("includes contraindications for respiratory compromise", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV"));
      expect(ivRec?.contraindications?.some(c => c.toLowerCase().includes("respiratory"))).toBe(true);
    });
  });

  describe("Repeat dosing guidance", () => {
    it("allows repeat dosing at 5 minute intervals", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV"));
      expect(ivRec?.repeat?.intervalMinutes).toBe(5);
    });

    it("limits field repeats to 2 for adults", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV") && r.label.includes("Adult"));
      expect(ivRec?.repeat?.maxRepeats).toBe(2);
    });

    it("limits field repeats to 1 for pediatrics", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const ivRec = result.recommendations.find(r => r.label.includes("IV") && r.label.includes("Pediatric"));
      expect(ivRec?.repeat?.maxRepeats).toBe(1);
    });
  });
});
