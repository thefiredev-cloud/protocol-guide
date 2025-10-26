import { describe, expect, it } from "vitest";

import { buildSearchAugmentation, triageInput } from "@/lib/triage";
import { ProtocolDocBuilder } from "@/lib/managers/ProtocolDocBuilder";

describe("Protocol 1210: Cardiac Arrest Enhancements", () => {
  describe("Triage Extraction", () => {
    it("should match cardiac arrest protocol with high score", () => {
      const query = "65 year old male cardiac arrest, witnessed by family, bystander CPR in progress";
      const result = triageInput(query);

      const protocol1210 = result.matchedProtocols.find(p => p.tp_code === "1210");
      expect(protocol1210).toBeDefined();
      expect(protocol1210?.score).toBeGreaterThan(2);
      expect(protocol1210?.pi_name).toBe("Cardiac Arrest - Non-traumatic");
    });

    it("should match cardiac arrest protocol for VF/VT query", () => {
      const query = "patient in ventricular fibrillation, pulseless, CPR initiated";
      const result = triageInput(query);

      const protocol1210 = result.matchedProtocols.find(p => p.tp_code === "1210");
      expect(protocol1210).toBeDefined();
      expect(protocol1210?.score).toBeGreaterThan(1);
    });

    it("should match cardiac arrest protocol for PEA/asystole query", () => {
      const query = "unresponsive pulseless patient, asystole on monitor";
      const result = triageInput(query);

      const protocol1210 = result.matchedProtocols.find(p => p.tp_code === "1210");
      expect(protocol1210).toBeDefined();
    });

    it("should match cardiac arrest protocol for ROSC mention", () => {
      const query = "post-ROSC patient, return of spontaneous circulation after CPR";
      const result = triageInput(query);

      const protocol1210 = result.matchedProtocols.find(p => p.tp_code === "1210");
      expect(protocol1210).toBeDefined();
    });

    it("should match cardiac arrest protocol for code/resuscitation", () => {
      const query = "code blue, resuscitation in progress, chest compressions";
      const result = triageInput(query);

      const protocol1210 = result.matchedProtocols.find(p => p.tp_code === "1210");
      expect(protocol1210).toBeDefined();
    });
  });

  describe("Search Augmentation", () => {
    it("should include ROSC and ETCO2 in search augmentation for cardiac arrest", () => {
      const query = "cardiac arrest patient";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("ROSC");
      expect(augmentation).toContain("ETCO2");
      expect(augmentation).toContain("epinephrine timing");
    });

    it("should include rhythm-specific terms in search augmentation", () => {
      const query = "ventricular fibrillation cardiac arrest";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("VF VT shockable rhythm");
      expect(augmentation).toContain("defibrillation immediate");
    });

    it("should include PEA/asystole terms in search augmentation", () => {
      const query = "pulseless electrical activity";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("PEA asystole");
      expect(augmentation).toContain("H's T's reversible causes");
    });

    it("should include medication timing terms in search augmentation", () => {
      const query = "cardiac arrest CPR";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("epinephrine 1mg every 3-5 minutes");
      expect(augmentation).toContain("amiodarone 300mg VF VT");
    });

    it("should include post-ROSC management terms", () => {
      const query = "cardiac arrest patient ROSC achieved";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("post-ROSC management");
      expect(augmentation).toContain("hyperventilation blood pressure 12-lead STEMI");
    });

    it("should include termination criteria terms", () => {
      const query = "cardiac arrest termination";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("termination resuscitation Ref 814");
      expect(augmentation).toContain("asystole 20 minutes 6 criteria");
    });

    it("should include prognostic factors in search augmentation", () => {
      const query = "witnessed cardiac arrest bystander CPR";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("witnessed arrest bystander CPR downtime prognosis");
    });

    it("should include CPR quality terms in search augmentation", () => {
      const query = "cardiac arrest chest compressions";
      const result = triageInput(query);
      const augmentation = buildSearchAugmentation(result);

      expect(augmentation).toContain("CPR quality compression rate depth recoil 100-120 per minute");
    });
  });

  describe("ProtocolDocBuilder - Documentation Generation", () => {
    const docBuilder = new ProtocolDocBuilder();

    it("should generate all 24 required documentation fields for cardiac arrest", () => {
      const mockPatientData = {
        age: 65,
        sex: "male",
        witnessed: "YES by family",
        bystanderCPR: "YES - compressions only",
        initialRhythm: "VF",
        downtime: 8,
      };

      const docs = docBuilder.build("1210", mockPatientData);

      expect(docs.requiredFields).toHaveLength(24);
      expect(docs.requiredFields).toContain("Witnessed vs. Unwitnessed (by whom: bystander/family/EMS)");
      expect(docs.requiredFields).toContain("Initial Rhythm (VF/VT/PEA/Asystole)");
      expect(docs.requiredFields).toContain("ETCO2 Values (initial, during CPR, trend, value at ROSC if achieved)");
      expect(docs.requiredFields).toContain("Medications - Epinephrine (exact times of each dose, interval between doses)");
      expect(docs.requiredFields).toContain("Post-ROSC 12-Lead ECG (STEMI present/absent, which leads if present)");
      expect(docs.requiredFields).toContain("Termination Criteria (all 6 per Ref 814 Section IIA if applicable)");
      expect(docs.requiredFields).toContain("Reversible Causes Assessed (H's & T's - which most likely, treatments attempted)");
    });

    it("should generate base contact template with correct structure", () => {
      const mockPatientData = {
        age: 58,
        sex: "female",
        witnessed: "NO - unwitnessed",
        bystanderCPR: "NO",
        initialRhythm: "Asystole",
        downtime: 15,
        cprDuration: 25,
        epinephrineDoses: 5,
      };

      const docs = docBuilder.build("1210", mockPatientData);

      expect(docs.baseContactReport).toContain("BASE HOSPITAL CONTACT TEMPLATE - PROTOCOL 1210");
      expect(docs.baseContactReport).toContain("Demographics:");
      expect(docs.baseContactReport).toContain("Arrest Circumstances:");
      expect(docs.baseContactReport).toContain("Resuscitation Performed:");
      expect(docs.baseContactReport).toContain("Current Status:");
      expect(docs.baseContactReport).toContain("Requesting:");
      expect(docs.baseContactReport).toContain("Reference: TP 1210 Cardiac Arrest");
    });

    it("should generate SOAP narrative with comprehensive structure", () => {
      const mockPatientData = {
        age: 72,
        sex: "male",
        witnessed: "witnessed by EMS",
      };

      const docs = docBuilder.build("1210", mockPatientData);

      expect(docs.suggestedNarrative).toContain("SUGGESTED ePCR NARRATIVE - PROTOCOL 1210");
      expect(docs.suggestedNarrative).toContain("**SUBJECTIVE:**");
      expect(docs.suggestedNarrative).toContain("**OBJECTIVE:**");
      expect(docs.suggestedNarrative).toContain("**ASSESSMENT:**");
      expect(docs.suggestedNarrative).toContain("**PLAN:**");
      expect(docs.suggestedNarrative).toContain("Working Impression: Cardiac Arrest - Non-traumatic (CANT)");
      expect(docs.suggestedNarrative).toContain("Protocol: TP 1210 Cardiac Arrest");
    });

    it("should include CPR quality metrics in SOAP narrative", () => {
      const docs = docBuilder.build("1210");

      expect(docs.suggestedNarrative).toContain("CPR Quality Metrics:");
      expect(docs.suggestedNarrative).toContain("Compression rate: 100-120/min");
      expect(docs.suggestedNarrative).toContain("Compression depth: 2-2.4 inches");
      expect(docs.suggestedNarrative).toContain("Full recoil:");
      expect(docs.suggestedNarrative).toContain("Compressor rotation: Every 2 minutes");
    });

    it("should include ROSC prediction factors in narrative", () => {
      const docs = docBuilder.build("1210");

      expect(docs.suggestedNarrative).toContain("ROSC Prediction Factors:");
      expect(docs.suggestedNarrative).toContain("Positive predictors present:");
      expect(docs.suggestedNarrative).toContain("Witnessed arrest");
      expect(docs.suggestedNarrative).toContain("Bystander CPR");
      expect(docs.suggestedNarrative).toContain("Initial shockable rhythm");
      expect(docs.suggestedNarrative).toContain("ETCO2 >20 mmHg");
    });

    it("should include H's & T's reversible causes assessment", () => {
      const docs = docBuilder.build("1210");

      expect(docs.suggestedNarrative).toContain("Reversible Causes Assessment (H's & T's):");
      expect(docs.suggestedNarrative).toContain("Hypovolemia:");
      expect(docs.suggestedNarrative).toContain("Hypoxia:");
      expect(docs.suggestedNarrative).toContain("Hyperkalemia:");
      expect(docs.suggestedNarrative).toContain("Hypothermia:");
      expect(docs.suggestedNarrative).toContain("Tension Pneumothorax:");
      expect(docs.suggestedNarrative).toContain("Tamponade:");
      expect(docs.suggestedNarrative).toContain("Toxins:");
      expect(docs.suggestedNarrative).toContain("Thrombosis-Coronary:");
      expect(docs.suggestedNarrative).toContain("Thrombosis-Pulmonary:");
    });

    it("should include timeline of resuscitation in narrative", () => {
      const docs = docBuilder.build("1210");

      expect(docs.suggestedNarrative).toContain("Timeline of Resuscitation:");
      expect(docs.suggestedNarrative).toContain("[TIME]");
      expect(docs.suggestedNarrative).toContain("Scene arrival");
      expect(docs.suggestedNarrative).toContain("Initial rhythm check:");
      expect(docs.suggestedNarrative).toContain("CPR initiated");
      expect(docs.suggestedNarrative).toContain("**Epinephrine 1mg IV/IO**");
    });

    it("should include post-ROSC management section", () => {
      const docs = docBuilder.build("1210");

      expect(docs.suggestedNarrative).toContain("**IF ROSC ACHIEVED - Post-ROSC Management:**");
      expect(docs.suggestedNarrative).toContain("ROSC confirmed, CPR stopped");
      expect(docs.suggestedNarrative).toContain("**Epinephrine administration STOPPED** immediately");
      expect(docs.suggestedNarrative).toContain("Ventilation adjusted: **10 breaths/min**");
      expect(docs.suggestedNarrative).toContain("SpO2 target 94-98%");
      expect(docs.suggestedNarrative).toContain("12-Lead ECG obtained:");
    });

    it("should include termination criteria section", () => {
      const docs = docBuilder.build("1210");

      expect(docs.suggestedNarrative).toContain("[IF TERMINATED] Death Determination:");
      expect(docs.suggestedNarrative).toContain("All 6 termination criteria met per Ref 814 Section IIA");
      expect(docs.suggestedNarrative).toContain("Age ≥18 years");
      expect(docs.suggestedNarrative).toContain("NOT witnessed by EMS");
      expect(docs.suggestedNarrative).toContain("NO shockable rhythm at any time");
      expect(docs.suggestedNarrative).toContain("Asystole after 20 minutes quality CPR");
    });

    it("should include medication summary sections", () => {
      const docs = docBuilder.build("1210");

      expect(docs.suggestedNarrative).toContain("Medications Administered - TOTAL:");
      expect(docs.suggestedNarrative).toContain("Epinephrine 1mg IV/IO:");
      expect(docs.suggestedNarrative).toContain("Amiodarone:");
      expect(docs.suggestedNarrative).toContain("Sodium Bicarbonate 50mEq:");
      expect(docs.suggestedNarrative).toContain("Calcium Chloride 1g:");
    });

    it("should work for pediatric protocol code 1210-P", () => {
      const docs = docBuilder.build("1210-P", { age: 8, sex: "male" });

      expect(docs.requiredFields).toHaveLength(24);
      expect(docs.baseContactReport).toContain("PROTOCOL 1210");
      expect(docs.suggestedNarrative).toContain("PROTOCOL 1210");
    });
  });

  describe("Integration - Full Workflow", () => {
    it("should handle complete cardiac arrest workflow from triage to documentation", () => {
      // Step 1: Triage identifies cardiac arrest
      const query = "70 year old male found unresponsive, pulseless, VF on monitor, bystander CPR in progress";
      const triageResult = triageInput(query);

      expect(triageResult.age).toBe(70);
      expect(triageResult.sex).toBe("male");

      const protocol1210 = triageResult.matchedProtocols.find(p => p.tp_code === "1210");
      expect(protocol1210).toBeDefined();

      // Step 2: Search augmentation includes cardiac arrest terms
      const augmentation = buildSearchAugmentation(triageResult);
      expect(augmentation).toContain("ROSC");
      expect(augmentation).toContain("VF VT");
      expect(augmentation).toContain("epinephrine");

      // Step 3: Documentation generated with all required fields
      const docBuilder = new ProtocolDocBuilder();
      const patientData = {
        age: triageResult.age,
        sex: triageResult.sex,
        witnessed: "YES by bystander",
        bystanderCPR: "YES - compressions only",
        initialRhythm: "VF",
        downtime: 5,
      };

      const docs = docBuilder.build("1210", patientData);
      expect(docs.requiredFields).toHaveLength(24);
      expect(docs.baseContactReport).toContain("70 year old male");
      expect(docs.baseContactReport).toContain("VF");
      expect(docs.suggestedNarrative).toContain("70yo male in cardiac arrest");
    });
  });
});
