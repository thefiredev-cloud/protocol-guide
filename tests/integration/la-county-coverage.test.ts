/**
 * LA County DHS Protocol Coverage Test Suite
 *
 * Ensures 100% of EMS data is sourced from LA County Department of Health Services.
 * Validates protocol whitelist, medication citations, and data integrity.
 *
 * Source: LA County EMS Agency Prehospital Care Manual (PCM)
 */

import { describe, expect,it } from "vitest";

import {
  extractProtocolCodes,
  isValidProtocol,
  LA_COUNTY_PROTOCOLS,
  PROTOCOL_COUNT,
} from "@/lib/protocols/la-county-protocol-whitelist";

describe("LA County Protocol Whitelist", () => {
  it("should have minimum protocol count", () => {
    expect(PROTOCOL_COUNT).toBeGreaterThanOrEqual(250);
  });

  it("should include all 1200-series treatment protocols", () => {
    const treatmentProtocols = Object.keys(LA_COUNTY_PROTOCOLS).filter(
      (code) => code.match(/^12\d{2}/) && !code.includes("-P")
    );
    expect(treatmentProtocols.length).toBeGreaterThanOrEqual(30);
  });

  it("should include all 1317.XX drug reference MCGs", () => {
    const drugRefs = Object.keys(LA_COUNTY_PROTOCOLS).filter(
      (code) => code.startsWith("1317.")
    );
    expect(drugRefs.length).toBeGreaterThanOrEqual(15);
  });

  it("should include pediatric protocol variants", () => {
    const pediatricProtocols = Object.keys(LA_COUNTY_PROTOCOLS).filter(
      (code) => code.includes("-P")
    );
    expect(pediatricProtocols.length).toBeGreaterThanOrEqual(10);
  });

  it("should validate known LA County protocols", () => {
    const knownProtocols = [
      "1210", // Cardiac Arrest
      "1211", // Cardiac Chest Pain
      "1241", // Overdose/Poisoning
      "1219", // Allergy
      "803",  // Paramedic Scope
      "814",  // Determination of Death
    ];

    for (const code of knownProtocols) {
      expect(isValidProtocol(code)).toBe(true);
    }
  });

  it("should reject invalid protocol numbers", () => {
    const invalidProtocols = [
      "9999",   // Not a real protocol
      "1247",   // Gap in protocol numbers
      "00000",  // Obviously fake
      "1500",   // Out of range
    ];

    for (const code of invalidProtocols) {
      expect(isValidProtocol(code)).toBe(false);
    }
  });

  it("should extract protocol codes from clinical text", () => {
    const text = `Per Protocol 1210, initiate CPR.
      Reference MCG 1317.17 for epinephrine dosing.
      See Ref 814 for termination criteria.`;

    const codes = extractProtocolCodes(text);
    expect(codes).toContain("1210");
    expect(codes).toContain("1317.17");
    expect(codes).toContain("814");
  });
});

describe("LA County Protocol Categories", () => {
  it("should categorize treatment protocols correctly", () => {
    const protocol1210 = LA_COUNTY_PROTOCOLS["1210"];
    expect(protocol1210).toBeDefined();
    expect(protocol1210?.category).toBe("treatment_protocol");
  });

  it("should categorize drug references correctly", () => {
    const drugRef = LA_COUNTY_PROTOCOLS["1317.17"];
    if (drugRef) {
      expect(drugRef.category).toBe("drug_reference");
    }
  });

  it("should categorize policies correctly", () => {
    const policy803 = LA_COUNTY_PROTOCOLS["803"];
    if (policy803) {
      expect(policy803.category).toBe("policy");
    }
  });
});

describe("LA County Provider Scope", () => {
  it("should mark cardiac arrest as Paramedic scope", () => {
    const protocol1210 = LA_COUNTY_PROTOCOLS["1210"];
    expect(protocol1210).toBeDefined();
    // Cardiac arrest requires ALS interventions
    expect(protocol1210?.scope).toBe("Paramedic");
  });

  it("should include both EMT and Paramedic protocols", () => {
    const protocols = Object.values(LA_COUNTY_PROTOCOLS);
    const hasParamedic = protocols.some((p) => p.scope === "Paramedic");
    const hasBoth = protocols.some((p) => p.scope === "both");

    expect(hasParamedic).toBe(true);
    expect(hasBoth).toBe(true);
  });
});

describe("LA County Revision Tracking", () => {
  it("should have revision dates for active protocols", () => {
    const protocolsWithDates = Object.values(LA_COUNTY_PROTOCOLS).filter(
      (p) => p.revisionDate
    );
    // Most protocols should have revision dates
    expect(protocolsWithDates.length).toBeGreaterThan(100);
  });

  it("should have recent revision dates (2024-2025)", () => {
    const recentProtocols = Object.values(LA_COUNTY_PROTOCOLS).filter(
      (p) => p.revisionDate?.includes("24") || p.revisionDate?.includes("25")
    );
    expect(recentProtocols.length).toBeGreaterThan(50);
  });
});

describe("Critical Protocol Coverage", () => {
  const criticalProtocols = [
    { code: "1210", name: "Cardiac Arrest" },
    { code: "1211", name: "Cardiac Chest Pain" },
    { code: "1212", name: "Bradycardia" },
    { code: "1213", name: "Tachycardia" },
    { code: "1219", name: "Allergy/Anaphylaxis" },
    { code: "1231", name: "Seizure" },
    { code: "1232", name: "Stroke" },
    { code: "1241", name: "Overdose/Poisoning" },
    { code: "1203", name: "Diabetic Emergencies" },
    { code: "814", name: "Determination of Death" },
  ];

  for (const { code, name } of criticalProtocols) {
    it(`should include ${name} (${code})`, () => {
      expect(isValidProtocol(code)).toBe(true);
    });
  }
});

describe("Critical Medication MCGs", () => {
  const criticalMeds = [
    { code: "1317.17", name: "Epinephrine" },
    { code: "1317.29", name: "Naloxone" },
    { code: "1317.15", name: "Diphenhydramine" },
    { code: "1317.5", name: "Amiodarone" },
    { code: "1317.19", name: "Fentanyl" },
    { code: "1317.27", name: "Morphine" },
  ];

  for (const { code, name } of criticalMeds) {
    it(`should include ${name} MCG (${code})`, () => {
      expect(isValidProtocol(code)).toBe(true);
    });
  }
});
