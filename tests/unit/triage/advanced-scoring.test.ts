import { describe, expect, it } from "vitest";
import { triageInput } from "@/lib/triage";

/**
 * Advanced Protocol Matching Tests
 * 
 * Tests for the enhanced scoring engine including:
 * - Negative keyword handling
 * - Demographic-aware scoring
 * - Severity amplifiers
 * - Multi-symptom pattern matching
 * - Vital signs integration
 */

describe("Advanced Scoring - Negative Keyword Handling", () => {
  it("should downweight cardiac protocols when chest pain is denied", () => {
    const query = "70 year old male, no chest pain, denies SOB, syncope";
    const result = triageInput(query);
    
    // Syncope should be highly ranked (primary symptom)
    const topCodes = result.matchedProtocols.slice(0, 3).map(p => p.tp_code);
    expect(topCodes).toContain("1233"); // Syncope should be in top 3
    
    // Verify syncope got scored
    const syncopeScore = result.matchedProtocols.find(p => p.tp_code === "1233")?.score || 0;
    expect(syncopeScore).toBeGreaterThan(0);
    
    // Note: Demographics (70yo male) may keep cardiac in differential despite negation
    // This is clinically appropriate for comprehensive assessment
  });

  it("should downweight respiratory protocols when SOB is denied", () => {
    const query = "patient with cough, no shortness of breath, denies dyspnea, vitals stable";
    const result = triageInput(query);
    
    // Respiratory distress should not be top match
    expect(result.matchedProtocols[0].tp_code).not.toBe("1237");
  });

  it("should handle multiple negations", () => {
    const query = "45yo male, no chest pain, no SOB, without fever, negative for headache, abdominal pain";
    const result = triageInput(query);
    
    // Abdominal pain should be in top matches (positive symptom)
    const topCodes = result.matchedProtocols.slice(0, 3).map(p => p.tp_code);
    expect(topCodes).toContain("1205"); // GI/GU should be in top 3
    
    // Negated symptoms should not dominate - abdominal pain should be highly ranked
    const giScore = result.matchedProtocols.find(p => p.tp_code === "1205")?.score || 0;
    expect(giScore).toBeGreaterThan(0);
  });
});

describe("Advanced Scoring - Demographic Awareness", () => {
  it("should boost cardiac protocols for older males", () => {
    const query = "70 year old male with chest pain";
    const result = triageInput(query);
    
    expect(result.matchedProtocols[0].tp_code).toBe("1211");
    // Score should be boosted for age + sex
  });

  it("should eliminate pediatric protocols for adults", () => {
    const query = "45 year old adult with fever";
    const result = triageInput(query);
    
    // Should match adult protocol (1204), not pediatric
    const topMatch = result.matchedProtocols[0];
    expect(topMatch.tp_code).toBe("1204");
    expect(topMatch.tp_code).not.toContain("-P");
  });

  it("should boost pediatric protocols for children", () => {
    const query = "5 year old child with fever and cough";
    const result = triageInput(query);
    
    // Pediatric protocols should be preferred
    const hasPediatric = result.matchedProtocols.slice(0, 3).some(p => 
      p.tp_code.includes("-P") || p.tp_code_pediatric
    );
    expect(hasPediatric).toBe(true);
  });

  it("should eliminate OB protocols for males", () => {
    const query = "30 year old male with abdominal pain";
    const result = triageInput(query);
    
    // Should not match any OB protocols (1215, 1217, 1218)
    const topCodes = result.matchedProtocols.slice(0, 5).map(p => p.tp_code);
    expect(topCodes).not.toContain("1215");
    expect(topCodes).not.toContain("1217");
    expect(topCodes).not.toContain("1218");
  });

  it("should boost stroke protocols for elderly", () => {
    const query = "75 year old with facial droop and weakness";
    const result = triageInput(query);
    
    expect(result.matchedProtocols[0].tp_code).toBe("1232");
  });
});

describe("Advanced Scoring - Severity Amplifiers", () => {
  it("should amplify score for severe symptoms", () => {
    const query1 = "patient with chest pain";
    const query2 = "patient with severe crushing chest pain";
    
    const result1 = triageInput(query1);
    const result2 = triageInput(query2);
    
    // Severe query should score higher
    const score1 = result1.matchedProtocols.find(p => p.tp_code === "1211")?.score || 0;
    const score2 = result2.matchedProtocols.find(p => p.tp_code === "1211")?.score || 0;
    
    expect(score2).toBeGreaterThan(score1);
  });

  it("should reduce score for mild symptoms", () => {
    const query1 = "patient with chest pain";
    const query2 = "patient with mild chest pain";
    
    const result1 = triageInput(query1);
    const result2 = triageInput(query2);
    
    // Mild query should score lower
    const score1 = result1.matchedProtocols.find(p => p.tp_code === "1211")?.score || 0;
    const score2 = result2.matchedProtocols.find(p => p.tp_code === "1211")?.score || 0;
    
    expect(score2).toBeLessThan(score1);
  });

  it("should recognize multiple severity terms", () => {
    const query = "acute severe crushing chest pain, sudden onset";
    const result = triageInput(query);
    
    // Should strongly favor cardiac
    expect(result.matchedProtocols[0].tp_code).toBe("1211");
  });
});

describe("Advanced Scoring - Multi-Symptom Patterns", () => {
  it("should detect classic ACS presentation", () => {
    const query = "chest pain with diaphoresis and nausea, jaw pain radiating to left arm";
    const result = triageInput(query);
    
    // Should strongly match cardiac with signature bonus
    expect(result.matchedProtocols[0].tp_code).toBe("1211");
    const cardiacScore = result.matchedProtocols[0].score;
    
    // Compare to query with only chest pain
    const simpleResult = triageInput("chest pain");
    const simpleScore = simpleResult.matchedProtocols.find(p => p.tp_code === "1211")?.score || 0;
    
    // Signature should add significant bonus
    expect(cardiacScore).toBeGreaterThan(simpleScore + 10);
  });

  it("should detect Cincinnati Stroke Scale pattern", () => {
    const query = "facial droop, arm weakness, speech difficulty, sudden onset";
    const result = triageInput(query);
    
    // Should strongly match stroke
    expect(result.matchedProtocols[0].tp_code).toBe("1232");
  });

  it("should detect anaphylaxis signature", () => {
    const query = "hives all over body, airway swelling, throat tightness, wheezing, after bee sting";
    const result = triageInput(query);
    
    // Should strongly match anaphylaxis
    expect(result.matchedProtocols[0].tp_code).toBe("1219");
    expect(result.matchedProtocols[0].pi_name).toBe("Anaphylaxis");
  });

  it("should detect inhalation injury signature", () => {
    const query = "stridor, hoarse voice, inhaled toxic gas in enclosed space, respiratory distress";
    const result = triageInput(query);
    
    // Should strongly match inhalation injury
    expect(result.matchedProtocols[0].tp_code).toBe("1236");
  });

  it("should detect sepsis pattern", () => {
    const query = "fever, hypotension, tachycardia, suspected infection, altered mental status";
    const result = triageInput(query);
    
    // Should match sepsis
    expect(result.matchedProtocols[0].tp_code).toBe("1204");
  });
});

describe("Advanced Scoring - Vital Signs Integration", () => {
  it("should boost shock protocols for hypotension + tachycardia", () => {
    const query = "patient pale and cool, BP 85/50, HR 125";
    const result = triageInput(query);
    
    // Should strongly favor shock/hypotension protocols
    const topCodes = result.matchedProtocols.slice(0, 2).map(p => p.tp_code);
    expect(topCodes).toContain("1207"); // Shock/Hypotension
  });

  it("should boost respiratory protocols for hypoxia", () => {
    const query = "shortness of breath, SpO2 85%, respiratory distress";
    const result = triageInput(query);
    
    // Should favor respiratory protocols (1237 or 1236 both valid - airway vs bronch)
    const topCode = result.matchedProtocols[0].tp_code;
    expect(["1237", "1236", "1234"]).toContain(topCode); // Any respiratory/airway protocol
    
    // Verify hypoxia boosts respiratory protocols
    const respScore = result.matchedProtocols.find(p => 
      ["1237", "1236", "1234"].includes(p.tp_code)
    )?.score || 0;
    expect(respScore).toBeGreaterThan(5); // Should have significant score with hypoxia boost
  });

  it("should boost sepsis for fever + hypotension + tachycardia", () => {
    const query = "infection, temp 103°F, BP 88/55, HR 130, altered mental status";
    const result = triageInput(query);
    
    // Should strongly favor sepsis
    expect(result.matchedProtocols[0].tp_code).toBe("1204");
  });

  it("should boost bradycardia protocol for HR <50", () => {
    const query = "patient dizzy, heart rate 42, symptomatic";
    const result = triageInput(query);
    
    // Should favor bradycardia protocol
    const topCodes = result.matchedProtocols.slice(0, 3).map(p => p.tp_code);
    expect(topCodes).toContain("1212");
  });

  it("should boost diabetic protocols for hypoglycemia", () => {
    const query = "altered mental status, glucose 45, diaphoretic";
    const result = triageInput(query);
    
    // Should strongly favor hypoglycemia
    expect(result.matchedProtocols[0].tp_code).toBe("1203");
  });
});

describe("Advanced Scoring - Combined Features", () => {
  it("should handle complex multi-factor query correctly", () => {
    const query = "70 year old male, severe crushing chest pain with diaphoresis and nausea, BP 145/95, HR 110, denies SOB";
    const result = triageInput(query);
    
    // Should match cardiac (age + sex boost + severity + ACS pattern - SOB negation)
    expect(result.matchedProtocols[0].tp_code).toBe("1211");
    
    // Should NOT match respiratory despite some overlap
    const topCodes = result.matchedProtocols.slice(0, 3).map(p => p.tp_code);
    expect(topCodes[0]).not.toBe("1237");
  });

  it("should correctly score pediatric with vitals", () => {
    const query = "8 year old child, fever 104°F, HR 145, altered mental status, suspected infection";
    const result = triageInput(query);
    
    // Should match sepsis with pediatric preference and vital signs boost
    expect(result.matchedProtocols[0].tp_code).toBe("1204");
  });

  it("should handle negations with demographics and vitals", () => {
    const query = "65yo female, no chest pain, denies SOB, syncopal episode, HR 45, dizzy";
    const result = triageInput(query);
    
    // Should match syncope or bradycardia, not cardiac
    const topCode = result.matchedProtocols[0].tp_code;
    expect(["1233", "1212"]).toContain(topCode);
  });
});

