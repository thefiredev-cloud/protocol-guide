import { describe, expect, it } from "vitest";

import { EpinephrineCalculator } from "@/lib/dosing/calculators/epinephrine";

describe("EpinephrineCalculator", () => {
  const calculator = new EpinephrineCalculator();

  describe("Calculator metadata", () => {
    it("has correct id", () => {
      expect(calculator.id).toBe("epinephrine");
    });

    it("has correct name", () => {
      expect(calculator.name).toBe("Epinephrine");
    });

    it("has aliases", () => {
      expect(calculator.aliases).toContain("epi");
      expect(calculator.aliases).toContain("adrenaline");
    });

    it("has categories", () => {
      expect(calculator.categories).toContain("Medication");
      expect(calculator.categories).toContain("MCG 1309");
    });
  });

  describe("Cardiac arrest dosing (IV/IO)", () => {
    it("calculates 1mg for adult (>=45kg, >=15 years)", () => {
      const result = calculator.calculate({ patientWeightKg: 70, patientAgeYears: 30 });
      expect(result.medicationId).toBe("epinephrine");
      expect(result.medicationName).toBe("Epinephrine");

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(1);
      expect(arrestRec?.dose.unit).toBe("mg");
      expect(arrestRec?.route).toBe("IV");
      expect(arrestRec?.repeat?.intervalMinutes).toBe(5);
      expect(arrestRec?.concentration?.label).toBe("0.1 mg/mL (1:10,000)");
    });

    it("calculates 0.01mg/kg for pediatric (<45kg)", () => {
      const result = calculator.calculate({ patientWeightKg: 20, patientAgeYears: 5 });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(0.2); // 20kg * 0.01mg/kg
      expect(arrestRec?.dose.unit).toBe("mg");
    });

    it("respects max 1mg ceiling for pediatric", () => {
      const result = calculator.calculate({ patientWeightKg: 150, patientAgeYears: 10 });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(1); // Max dose is 1mg
    });

    it("uses age-based adult determination (15+ years even if <45kg)", () => {
      const result = calculator.calculate({ patientWeightKg: 40, patientAgeYears: 16 });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(1); // Adult dose due to age
    });

    it("uses weight-based adult determination (>=45kg even if <15 years)", () => {
      const result = calculator.calculate({ patientWeightKg: 50, patientAgeYears: 12 });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(1); // Adult dose due to weight
    });
  });

  describe("Anaphylaxis dosing (IM)", () => {
    it("calculates 0.5mg for adult", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        patientAgeYears: 30,
        scenario: "anaphylaxis"
      });

      const anaRec = result.recommendations.find(r => r.label === "Anaphylaxis IM");
      expect(anaRec).toBeDefined();
      expect(anaRec?.dose.quantity).toBe(0.5);
      expect(anaRec?.dose.unit).toBe("mg");
      expect(anaRec?.route).toBe("IM");
      expect(anaRec?.concentration?.label).toBe("1 mg/mL (1:1,000)");
      expect(anaRec?.administrationNotes).toContain("Administer in lateral thigh");
      expect(anaRec?.repeat?.intervalMinutes).toBe(10);
      expect(anaRec?.repeat?.maxRepeats).toBe(2);
    });

    it("calculates weight-based dose for pediatric with max 0.3mg", () => {
      const result = calculator.calculate({
        patientWeightKg: 20,
        patientAgeYears: 5,
        scenario: "anaphylaxis"
      });

      const anaRec = result.recommendations.find(r => r.label === "Anaphylaxis IM");
      expect(anaRec).toBeDefined();
      // 20kg * 0.01mg/kg = 0.2mg, max 0.3mg
      expect(anaRec?.dose.quantity).toBe(0.2);
    });

    it("respects 0.3mg max for pediatric", () => {
      const result = calculator.calculate({
        patientWeightKg: 40,
        patientAgeYears: 10,
        scenario: "anaphylaxis"
      });

      const anaRec = result.recommendations.find(r => r.label === "Anaphylaxis IM");
      expect(anaRec).toBeDefined();
      // 40kg * 0.01mg/kg = 0.4mg, but max 0.3mg
      expect(anaRec?.dose.quantity).toBe(0.3);
    });

    it("provides IM route recommendation for anaphylaxis", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        route: "IM",
        scenario: "anaphylaxis"
      });

      const anaRec = result.recommendations.find(r => r.label === "Anaphylaxis IM");
      expect(anaRec).toBeDefined();
      expect(anaRec?.route).toBe("IM");
    });
  });

  describe("Push-dose epinephrine (hypotension/ROSC)", () => {
    it("provides push-dose recommendation", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        systolicBP: 85
      });

      const pushRec = result.recommendations.find(r => r.label === "Push-Dose (Hypotension/Rosc)");
      expect(pushRec).toBeDefined();
      expect(pushRec?.dose.quantity).toBe(10);
      expect(pushRec?.dose.unit).toBe("mcg");
      expect(pushRec?.route).toBe("IV");
      expect(pushRec?.concentration?.label).toBe("10 mcg/mL mixture");
      expect(pushRec?.repeat?.intervalMinutes).toBe(1);
      expect(pushRec?.repeat?.criteria).toContain("SBP > 90");
      expect(pushRec?.administrationNotes).toBeDefined();
    });

    it("adds warning for severe hypotension (SBP <70)", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        systolicBP: 65
      });

      expect(result.warnings).toContain("Push-dose epi requires cautious titration; SBP <70.");
    });

    it("does not add warning for SBP >=70", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        systolicBP: 75
      });

      const warning = result.warnings.find(w => w.includes("SBP <70"));
      expect(warning).toBeUndefined();
    });
  });

  describe("Nebulized epinephrine for airway swelling", () => {
    it("provides neb recommendation for stridor scenario", () => {
      const result = calculator.calculate({
        patientWeightKg: 30,
        scenario: "stridor"
      });

      const nebRec = result.recommendations.find(r => r.label === "Airway Swelling (Neb)");
      expect(nebRec).toBeDefined();
      expect(nebRec?.dose.quantity).toBe(5);
      expect(nebRec?.dose.unit).toBe("mg");
      expect(nebRec?.route).toBe("Neb");
      expect(nebRec?.administrationNotes).toContain("Use 1 mg/mL concentration");
    });

    it("provides neb recommendation when route is Neb", () => {
      const result = calculator.calculate({
        patientWeightKg: 30,
        route: "Neb"
      });

      const nebRec = result.recommendations.find(r => r.label === "Airway Swelling (Neb)");
      expect(nebRec).toBeDefined();
    });
  });

  describe("Severe bronchospasm (IM)", () => {
    it("provides bronchospasm IM recommendation for adults", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        patientAgeYears: 30,
        scenario: "bronchospasm"
      });

      const bronchRec = result.recommendations.find(r => r.label === "Severe Bronchospasm IM");
      expect(bronchRec).toBeDefined();
      expect(bronchRec?.dose.quantity).toBe(0.5);
      expect(bronchRec?.dose.unit).toBe("mg");
      expect(bronchRec?.route).toBe("IM");
    });

    it("calculates weight-based dose for pediatric", () => {
      const result = calculator.calculate({
        patientWeightKg: 20,
        patientAgeYears: 5,
        scenario: "bronchospasm"
      });

      const bronchRec = result.recommendations.find(r => r.label === "Severe Bronchospasm IM");
      expect(bronchRec).toBeDefined();
      expect(bronchRec?.dose.quantity).toBe(0.2); // 20kg * 0.01mg/kg
    });
  });

  describe("Edge cases and defaults", () => {
    it("handles missing weight (defaults to 70kg)", () => {
      const result = calculator.calculate({ patientAgeYears: 30 });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(1); // Adult dose
    });

    it("handles missing age (defaults to 30 years)", () => {
      const result = calculator.calculate({ patientWeightKg: 70 });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(1); // Adult dose
    });

    it("handles extremely low weight (3kg premie)", () => {
      const result = calculator.calculate({
        patientWeightKg: 3,
        patientAgeYears: 0
      });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(0.03); // 3kg * 0.01mg/kg
    });

    it("handles extremely high weight (150kg)", () => {
      const result = calculator.calculate({
        patientWeightKg: 150,
        patientAgeYears: 40
      });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      expect(arrestRec?.dose.quantity).toBe(1); // Adult dose (max)
    });

    it("handles missing SBP (defaults to 80)", () => {
      const result = calculator.calculate({ patientWeightKg: 70 });

      // Should not have SBP <70 warning with default SBP of 80
      const sbpWarning = result.warnings.find(w => w.includes("SBP <70"));
      expect(sbpWarning).toBeUndefined();
    });

    it("handles missing scenario (provides all routes)", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        patientAgeYears: 30
      });

      // When no scenario specified, should provide multiple routes
      expect(result.recommendations.length).toBeGreaterThan(1);
      expect(result.recommendations.some(r => r.label === "Cardiac Arrest IV/IO")).toBe(true);
      expect(result.recommendations.some(r => r.label === "Anaphylaxis IM")).toBe(true);
    });

    it("filters recommendations by route when specified", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        route: "IM"
      });

      // Should include IM routes
      expect(result.recommendations.some(r => r.route === "IM")).toBe(true);
      // Should not include IV-only routes (push-dose)
      expect(result.recommendations.some(r => r.label === "Cardiac Arrest IV/IO")).toBe(false);
    });
  });

  describe("Citations", () => {
    it("includes proper protocol citations", () => {
      const result = calculator.calculate({ patientWeightKg: 70 });

      expect(result.citations).toContain("MCG 1309");
      expect(result.citations).toContain("1317.17");
    });
  });

  describe("Multiple recommendations", () => {
    it("provides all relevant recommendations when no route specified", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        patientAgeYears: 30
      });

      // Should provide cardiac arrest, anaphylaxis, push-dose, neb, and bronchospasm
      expect(result.recommendations.length).toBeGreaterThanOrEqual(5);
    });

    it("provides scenario-specific recommendations", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        scenario: "anaphylaxis"
      });

      // Anaphylaxis scenario should still include IM anaphylaxis recommendation
      expect(result.recommendations.some(r => r.label === "Anaphylaxis IM")).toBe(true);
    });

    it("provides IV recommendations for cardiac arrest scenario", () => {
      const result = calculator.calculate({
        patientWeightKg: 70,
        scenario: "arrest"
      });

      expect(result.recommendations.some(r => r.label === "Cardiac Arrest IV/IO")).toBe(true);
      expect(result.recommendations.some(r => r.label === "Push-Dose (Hypotension/Rosc)")).toBe(true);
    });
  });

  describe("Precision and rounding", () => {
    it("rounds doses appropriately for very small weights", () => {
      const result = calculator.calculate({
        patientWeightKg: 2.5,
        patientAgeYears: 0
      });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      // 2.5kg * 0.01mg/kg = 0.025mg, rounded to 0.03mg (2 decimal places)
      expect(arrestRec?.dose.quantity).toBe(0.03);
    });

    it("handles decimal weights correctly", () => {
      const result = calculator.calculate({
        patientWeightKg: 15.5,
        patientAgeYears: 3
      });

      const arrestRec = result.recommendations.find(r => r.label === "Cardiac Arrest IV/IO");
      expect(arrestRec).toBeDefined();
      // 15.5kg * 0.01mg/kg = 0.155mg, rounded to 0.16mg (2 decimal places)
      expect(arrestRec?.dose.quantity).toBe(0.16);
    });
  });
});
