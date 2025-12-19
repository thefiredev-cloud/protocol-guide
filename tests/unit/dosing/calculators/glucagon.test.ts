import { describe, expect, it } from "vitest";

import { GlucagonCalculator } from "@/lib/dosing/calculators/glucagon";

describe("GlucagonCalculator", () => {
  const calculator = new GlucagonCalculator();

  describe("Calculator metadata", () => {
    it("has correct id", () => {
      expect(calculator.id).toBe("glucagon");
    });

    it("has correct name", () => {
      expect(calculator.name).toBe("Glucagon");
    });

    it("has aliases including Baqsimi", () => {
      expect(calculator.aliases).toContain("baqsimi");
      expect(calculator.aliases).toContain("glucagen");
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
  });

  describe("Adult hypoglycemia dosing", () => {
    it("gives 1mg IM/SubQ for adult hypoglycemia", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const imRec = result.recommendations.find(r => r.label.includes("IM") && r.label.includes("Adult"));
      expect(imRec).toBeDefined();
      expect(imRec?.dose.quantity).toBe(1);
      expect(imRec?.dose.unit).toBe("mg");
      expect(imRec?.route).toBe("IM");
    });

    it("provides IN route (Baqsimi) for adults", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const inRec = result.recommendations.find(r => r.label.includes("IN") && r.label.includes("Adult"));
      expect(inRec).toBeDefined();
      expect(inRec?.dose.quantity).toBe(3); // Baqsimi is 3mg
      expect(inRec?.route).toBe("IN");
    });

    it("warns about depleted glycogen stores", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.warnings.some(w => w.toLowerCase().includes("glycogen"))).toBe(true);
    });
  });

  describe("Pediatric hypoglycemia dosing", () => {
    it("calculates 0.03mg/kg for pediatric IM", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const pedIMRec = result.recommendations.find(r => r.label.includes("IM") && r.label.includes("Pediatric"));
      expect(pedIMRec).toBeDefined();
      expect(pedIMRec?.dose.quantity).toBe(0.6); // 20kg * 0.03mg/kg = 0.6mg
    });

    it("respects 1mg max dose for pediatrics", () => {
      const result = calculator.calculate({ patientWeightKg: 40, patientAgeYears: 10 });
      
      const pedIMRec = result.recommendations.find(r => r.label.includes("IM") && r.label.includes("Pediatric"));
      expect(pedIMRec).toBeDefined();
      // 40kg * 0.03mg/kg = 1.2mg, but max is 1mg
      expect(pedIMRec?.dose.quantity).toBe(1);
    });

    it("provides fixed dose alternative (<25kg = 0.5mg)", () => {
      const result = calculator.calculate({ patientWeightKg: 15, patientAgeYears: 3 });
      
      const pedIMRec = result.recommendations.find(r => r.label.includes("IM") && r.label.includes("Pediatric"));
      expect(pedIMRec?.administrationNotes?.some(n => n.includes("0.5mg"))).toBe(true);
    });

    it("provides fixed dose alternative (≥25kg = 1mg)", () => {
      const result = calculator.calculate({ patientWeightKg: 30, patientAgeYears: 8 });
      
      const pedIMRec = result.recommendations.find(r => r.label.includes("IM") && r.label.includes("Pediatric"));
      expect(pedIMRec?.administrationNotes?.some(n => n.includes("1mg") && n.includes("≥25kg"))).toBe(true);
    });

    it("provides Baqsimi IN for pediatrics with age warning", () => {
      const result = calculator.calculate({ patientWeightKg: 12, patientAgeYears: 3 });
      
      const pedINRec = result.recommendations.find(r => r.label.includes("IN") && r.label.includes("Pediatric"));
      expect(pedINRec).toBeDefined();
      expect(pedINRec?.dose.quantity).toBe(3); // Baqsimi is always 3mg
      // Should have warning about <4 years
      expect(pedINRec?.contraindications?.some(c => c.includes("<4 years"))).toBe(true);
    });
  });

  describe("Beta-blocker overdose dosing", () => {
    it("provides beta-blocker OD dosing when scenario specified", () => {
      const result = calculator.calculate({ 
        patientWeightKg: 70, 
        patientAgeYears: 30,
        scenario: "beta blocker overdose"
      });
      
      const odRec = result.recommendations.find(r => r.label.includes("Beta-Blocker"));
      expect(odRec).toBeDefined();
      expect(odRec?.dose.quantity).toBe(5); // 3-5mg initial
      expect(odRec?.route).toBe("IV");
    });

    it("includes beta-blocker dosing by default (no scenario)", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const odRec = result.recommendations.find(r => r.label.includes("Beta-Blocker"));
      expect(odRec).toBeDefined();
    });

    it("requires Base Hospital contact for overdose indication", () => {
      const result = calculator.calculate({ 
        patientWeightKg: 70, 
        patientAgeYears: 30,
        scenario: "toxicity"
      });
      
      const odRec = result.recommendations.find(r => r.label.includes("Beta-Blocker"));
      expect(odRec?.administrationNotes?.some(n => n.includes("BASE HOSPITAL"))).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("handles very low pediatric weight (3kg)", () => {
      const result = calculator.calculate({ patientWeightKg: 3, patientAgeYears: 0.5 });
      
      expect(result.metadata?.error).toBeUndefined();
      const pedRec = result.recommendations.find(r => r.label.includes("Pediatric"));
      expect(pedRec).toBeDefined();
      expect(pedRec?.dose.quantity).toBe(0.09); // 3kg * 0.03mg/kg
    });

    it("includes protocol citations", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.citations).toContain("TP 1203");
      expect(result.citations).toContain("TP 1241");
    });
  });

  describe("Route selection", () => {
    it("provides both IM and IN routes for adults", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      
      const routes = result.recommendations.map(r => r.route);
      expect(routes).toContain("IM");
      expect(routes).toContain("IN");
    });

    it("provides both IM and IN routes for pediatrics", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });
      
      const pedRecs = result.recommendations.filter(r => r.label.includes("Pediatric"));
      const routes = pedRecs.map(r => r.route);
      expect(routes).toContain("IM");
      expect(routes).toContain("IN");
    });
  });
});
