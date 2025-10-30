import { describe, expect, it } from "vitest";
import { triageInput, buildSearchAugmentation } from "@/lib/triage";

/**
 * Validation test for the original failing query
 * 
 * This test demonstrates that the enhanced protocol matching system
 * correctly identifies Inhalation Injury (Protocol 1236) for the exact
 * query that was previously failing.
 */

describe("Original Issue - Inhalation Injury Query", () => {
  const ORIGINAL_FAILING_QUERY = "45 year old male inhalation injury. inhaled gas and now is short of breathe. vitals stable. has stridor and no history allergies or meds";

  it("should correctly identify Protocol 1236 as top match", () => {
    const result = triageInput(ORIGINAL_FAILING_QUERY);
    
    // Top protocol should be Inhalation Injury
    expect(result.matchedProtocols.length).toBeGreaterThan(0);
    expect(result.matchedProtocols[0].tp_code).toBe("1236");
    expect(result.matchedProtocols[0].tp_name).toBe("Inhalation Injury");
    expect(result.matchedProtocols[0].pi_name).toBe("Inhalation Injury");
  });

  it("should extract correct demographics", () => {
    const result = triageInput(ORIGINAL_FAILING_QUERY);
    
    expect(result.age).toBe(45);
    expect(result.sex).toBe("male");
  });

  it("should identify stridor as critical symptom", () => {
    const result = triageInput(ORIGINAL_FAILING_QUERY);
    
    // Stridor is critical (10 pts) - should dominate scoring
    const score = result.matchedProtocols[0].score;
    expect(score).toBeGreaterThan(15); // Should have high score from critical keywords
  });

  it("should NOT match irrelevant protocols in top 3", async () => {
    const result = triageInput(ORIGINAL_FAILING_QUERY);
    
    const topCodes = result.matchedProtocols.slice(0, 3).map(p => p.tp_code);
    
    // Should NOT contain Crush Injury or Hypothermia
    expect(topCodes).not.toContain("1242"); // Crush Injury
    expect(topCodes).not.toContain("1223"); // Hypothermia
  });

  it("should score highly for critical airway symptoms", () => {
    const result = triageInput(ORIGINAL_FAILING_QUERY);
    
    // Critical keywords (stridor, inhaled, gas) should generate high score
    const topScore = result.matchedProtocols[0].score;
    expect(topScore).toBeGreaterThan(20); // Significant score from critical keywords
  });

  it("should have inhalation-specific search augmentation", () => {
    const result = triageInput(ORIGINAL_FAILING_QUERY);
    
    // Search augmentation should include inhalation-specific terms
    const searchAug = buildSearchAugmentation(result);
    expect(searchAug).toContain("Inhalation Injury");
    expect(searchAug).toContain("1236");
    expect(searchAug).toContain("stridor hoarseness airway burn");
  });
});

describe("Original Issue - System Behavior Validation", () => {
  it("should apply clinical signature bonus for inhalation pattern", () => {
    const query = "inhaled toxic gas, now has stridor and hoarse voice";
    const result = triageInput(query);
    
    // Should detect "inhaled + gas" signature AND "stridor + hoarse" signature
    expect(result.matchedProtocols[0].tp_code).toBe("1236");
    
    // Score should include signature bonus (~18 pts)
    const score = result.matchedProtocols[0].score;
    expect(score).toBeGreaterThan(20); // Base + signature
  });

  it("should differentiate inhalation injury from burns", () => {
    const queryInhalation = "inhaled gas, stridor, hoarseness";
    const queryBurns = "thermal burn to skin, blistering";
    
    const resultInhalation = triageInput(queryInhalation);
    const resultBurns = triageInput(queryBurns);
    
    // Should match different protocols
    expect(resultInhalation.matchedProtocols[0].tp_code).toBe("1236"); // Inhalation
    expect(resultBurns.matchedProtocols[0].tp_code).toBe("1220"); // Burns
  });

  it("should differentiate inhalation injury from airway obstruction", () => {
    const queryInhalation = "inhaled chemical fumes, stridor";
    const queryObstruction = "choking on food, foreign body, stridor";
    
    const resultInhalation = triageInput(queryInhalation);
    const resultObstruction = triageInput(queryObstruction);
    
    // Should match different protocols based on context
    expect(resultInhalation.matchedProtocols[0].tp_code).toBe("1236"); // Inhalation
    expect(resultObstruction.matchedProtocols[0].tp_code).toBe("1234"); // Obstruction
  });

  it("should differentiate inhalation injury from carbon monoxide", () => {
    const queryInhalation = "inhaled toxic gas, stridor, hoarse";
    const queryCO = "carbon monoxide exposure, headache, nausea from smoke";
    
    const resultInhalation = triageInput(queryInhalation);
    const resultCO = triageInput(queryCO);
    
    // Should match different protocols
    expect(resultInhalation.matchedProtocols[0].tp_code).toBe("1236"); // Inhalation
    
    // CO should be in top matches for CO query
    const topCodes = resultCO.matchedProtocols.slice(0, 3).map(p => p.tp_code);
    expect(topCodes).toContain("1238"); // Carbon Monoxide
  });
});

describe("Original Issue - End-to-End Workflow", () => {
  it("should provide complete triage result for original query", () => {
    const query = "45 year old male inhalation injury. inhaled gas and now is short of breathe. vitals stable. has stridor and no history allergies or meds";
    const result = triageInput(query);
    
    // Verify all components
    expect(result.age).toBe(45);
    expect(result.sex).toBe("male");
    expect(result.chiefComplaint).toBe("inhalation injury");
    expect(result.matchedProtocols[0].tp_code).toBe("1236");
    expect(result.matchedProtocols[0].tp_name).toBe("Inhalation Injury");
    
    // Verify search query augmentation includes inhalation-specific terms
    const searchAug = buildSearchAugmentation(result);
    
    expect(searchAug).toContain("Inhalation Injury");
    expect(searchAug).toContain("1236");
    expect(searchAug).toContain("stridor");
  });

  it("should demonstrate all scoring layers working together", () => {
    // Query with multiple scoring factors
    const query = "70 year old male, severe crushing chest pain with diaphoresis and nausea, BP 145/95, HR 110, denies SOB";
    const result = triageInput(query);
    
    // Should identify cardiac as top match with:
    // - Base keywords: chest pain, diaphoresis, nausea
    // - Severity: "severe", "crushing"
    // - Demographics: 70yo male (high cardiac risk)
    // - Vitals: HR 110 (borderline tachycardia)
    // - Signature: ACS pattern (chest pain + diaphoresis + nausea)
    // - Negation: "denies SOB" should downweight respiratory
    
    expect(result.matchedProtocols[0].tp_code).toBe("1211"); // Cardiac
    
    // Respiratory should not be in top match due to negation
    expect(result.matchedProtocols[0].tp_code).not.toBe("1237");
  });
});

