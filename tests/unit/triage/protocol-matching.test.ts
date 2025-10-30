import { describe, expect, it } from "vitest";
import { triageInput } from "@/lib/triage";

/**
 * Protocol Matching Regression Tests
 * 
 * These tests ensure critical scenarios correctly identify the appropriate
 * LA County PCM protocol as the top match.
 */

describe("Protocol Matching - Critical Scenarios", () => {
  describe("Inhalation Injury (Protocol 1236)", () => {
    it("should match for gas exposure with stridor (regression case)", () => {
      const query = "45 year old male inhalation injury. inhaled gas and now is short of breathe. vitals stable. has stridor and no history allergies or meds";
      const result = triageInput(query);
      
      expect(result.matchedProtocols.length).toBeGreaterThan(0);
      expect(result.matchedProtocols[0].tp_code).toBe("1236");
      expect(result.matchedProtocols[0].tp_name).toBe("Inhalation Injury");
    });

    it("should match for chemical fume exposure", () => {
      const query = "32 yo female exposed to toxic fumes, hoarse voice, difficulty breathing";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1236");
    });

    it("should match for gas inhalation with respiratory distress", () => {
      const query = "patient inhaled gas in enclosed space, now SOB with stridor";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1236");
    });
  });

  describe("Airway Obstruction (Protocol 1234)", () => {
    it("should match for choking with foreign body", () => {
      const query = "choking patient, foreign body obstruction, unable to speak";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1234");
      expect(result.matchedProtocols[0].tp_name).toBe("Airway Obstruction");
    });

    it("should match for croup with stridor", () => {
      const query = "2 year old with croup, stridor, barking cough";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1234");
    });
  });

  describe("Anaphylaxis (Protocol 1219)", () => {
    it("should match for anaphylaxis with airway swelling", () => {
      const query = "anaphylaxis, throat swelling, hives, wheezing after bee sting";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1219");
      expect(result.matchedProtocols[0].pi_name).toBe("Anaphylaxis");
    });

    it("should match for severe allergic reaction", () => {
      const query = "severe allergic reaction with angioedema and hypotension";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1219");
    });
  });

  describe("Stroke (Protocol 1232)", () => {
    it("should match for facial droop and weakness", () => {
      const query = "67 yo male facial droop, arm weakness, slurred speech";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1232");
      expect(result.matchedProtocols[0].tp_name).toBe("Stroke / CVA / TIA");
    });

    it("should match for CVA symptoms", () => {
      const query = "suspected CVA, FAST positive, right sided weakness";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1232");
    });
  });

  describe("Cardiac Arrest (Protocol 1210)", () => {
    it("should match for pulseless unresponsive patient", () => {
      const query = "pulseless unresponsive, starting CPR";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1210");
      expect(result.matchedProtocols[0].tp_name).toBe("Cardiac Arrest");
    });

    it("should match for cardiac arrest with code", () => {
      const query = "cardiac arrest, code blue, no pulse";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1210");
    });
  });

  describe("Crush Injury (Protocol 1242)", () => {
    it("should match for entrapment with crush injury", () => {
      const query = "patient entrapped for 2 hours, crush injury to legs, circumferential compression";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1242");
      expect(result.matchedProtocols[0].tp_name).toBe("Crush Injury/Syndrome");
    });

    it("should match for rhabdomyolysis concern", () => {
      const query = "crush syndrome, large muscle groups, concern for rhabdomyolysis";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1242");
    });
  });

  describe("Respiratory Distress (Protocol 1237)", () => {
    it("should match for asthma exacerbation", () => {
      const query = "asthma exacerbation, wheezing, SOB, unable to speak full sentences";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1237");
      expect(result.matchedProtocols[0].pi_name).toBe("Respiratory Distress / Bronchospasm");
    });

    it("should match for COPD with respiratory distress", () => {
      const query = "COPD patient with dyspnea and bronchospasm";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1237");
    });
  });

  describe("Submersion/Drowning (Protocol 1225)", () => {
    it("should match for drowning victim", () => {
      const query = "near drowning, pulled from water, respiratory distress";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1225");
      expect(result.matchedProtocols[0].tp_name).toBe("Submersion");
    });

    it("should match for submersion injury", () => {
      const query = "submersion injury, water rescue";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1225");
    });
  });

  describe("Hypothermia (Protocol 1223)", () => {
    it("should match for cold exposure", () => {
      const query = "hypothermia, found outside in cold, low temperature";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1223");
      expect(result.matchedProtocols[0].tp_name).toBe("Hypothermia / Cold Injury");
    });

    it("should match for frostbite", () => {
      const query = "frostbite to extremities, cold exposure";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1223");
    });
  });

  describe("Overdose/Poisoning (Protocol 1241)", () => {
    it("should match for opioid overdose", () => {
      const query = "opioid overdose, unresponsive, pinpoint pupils";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1241");
      expect(result.matchedProtocols[0].tp_name).toBe("Overdose/Poisoning/Ingestion");
    });

    it("should match for poisoning", () => {
      const query = "toxic ingestion, poisoning, altered mental status";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1241");
    });
  });

  describe("Sepsis (Protocol 1204)", () => {
    it("should match for suspected sepsis", () => {
      const query = "sepsis, fever, hypotension, tachycardia, altered mental status";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1204");
      expect(result.matchedProtocols[0].pi_name).toBe("Sepsis");
    });

    it("should match for septic patient", () => {
      const query = "septic shock, infection, SIRS criteria";
      const result = triageInput(query);
      
      expect(result.matchedProtocols[0].tp_code).toBe("1204");
    });
  });
});

describe("Protocol Matching - Weighted Scoring Validation", () => {
  it("should prioritize critical symptoms over general terms", () => {
    // "stridor" is critical (10 points) vs "injury" is low (0.5 points)
    const query = "patient has stridor";
    const result = triageInput(query);
    
    // Should match airway/inhalation protocols, not general injury
    const topMatch = result.matchedProtocols[0];
    expect(["1234", "1236"]).toContain(topMatch.tp_code);
  });

  it("should correctly identify inhalation injury over burns when gas mentioned", () => {
    const query = "inhaled gas, now has stridor and hoarseness";
    const result = triageInput(query);
    
    // Should match inhalation (1236), not burns (1220)
    expect(result.matchedProtocols[0].tp_code).toBe("1236");
  });

  it("should differentiate carbon monoxide from general inhalation injury", () => {
    const query = "carbon monoxide exposure, headache, nausea from smoke";
    const result = triageInput(query);
    
    // Should match CO (1238), though inhalation (1236) may also be in top 3
    const topCodes = result.matchedProtocols.slice(0, 3).map(p => p.tp_code);
    expect(topCodes).toContain("1238");
  });
});

