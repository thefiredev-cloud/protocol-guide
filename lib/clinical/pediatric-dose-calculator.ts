/*
  PediatricDoseCalculator implements a small, testable API for LA County MCG 1309
  weight-based pediatric dosing. It returns clearly formatted mg and mL values
  tied to specific medication formulations with maximums where specified.

  Scope is intentionally narrow and PCM-backed. Extend by adding new calculators
  to the MED_CALCULATORS registry below.
*/

import { colorForWeight } from "@/lib/clinical/peds-color";

export type PediatricDoseInput = {
  medicationKey: string; // canonical key, e.g., "atropine"
  weightKg: number;
};

export type PediatricDoseResult = {
  medicationKey: string;
  displayName: string;
  route: string;
  concentration: string; // e.g., "0.1 mg/mL"
  doseMg?: number; // when applicable
  doseMl?: number; // when applicable
  doseUnits?: string; // e.g., "mEq" for bicarbonate
  summaryLine: string; // human-readable one-liner
  notes?: string[];
  citations: string[]; // e.g., ["MCG 1309", "Drug Reference – Atropine (1317.9)"]
};

function round(value: number, digits = 2): number {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
}

function toCleanNumberString(value: number, digits = 2): string {
  const fixed = value.toFixed(digits);
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

type Calculator = (weightKg: number) => PediatricDoseResult;

const MED_CALCULATORS: Record<string, Calculator> = {
  // Atropine 0.1 mg/mL, 0.02 mg/kg, pediatric max single 0.5 mg
  atropine: (kg) => {
    const mg = Math.min(round(kg * 0.02, 2), 0.5);
    const ml = round(mg / 0.1, 2);
    const mgStr = toCleanNumberString(mg, 2);
    const mlStr = toCleanNumberString(ml, 2);
    return {
      medicationKey: "atropine",
      displayName: "Atropine",
      route: "IV/IO",
      concentration: "0.1 mg/mL",
      doseMg: mg,
      doseMl: ml,
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Atropine 0.02 mg/kg: ${mgStr} mg (${mlStr} mL) IV/IO`,
      notes: ["Maximum pediatric single dose 0.5 mg"],
      citations: ["MCG 1309", "Drug Reference – Atropine (1317.9)"],
    };
  },

  // Epinephrine 1 mg/mL (IM) 0.01 mg/kg
  epinephrine_im: (kg) => {
    const mg = round(kg * 0.01, 2);
    const ml = round(mg / 1, 2); // 1 mg/mL
    return {
      medicationKey: "epinephrine_im",
      displayName: "Epinephrine (IM)",
      route: "IM",
      concentration: "1 mg/mL",
      doseMg: mg,
      doseMl: ml,
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Epinephrine IM 0.01 mg/kg: ${toCleanNumberString(mg)} mg (${toCleanNumberString(ml)} mL)`,
      citations: ["MCG 1309", "Drug Reference – Epinephrine (1317.13)"]
    };
  },

  // Dextrose 10% (0.1 g/mL) 5 mL/kg
  d10: (kg) => {
    const ml = round(kg * 5, 0);
    return {
      medicationKey: "d10",
      displayName: "Dextrose 10%",
      route: "IV slow push",
      concentration: "0.1 g/mL",
      doseMl: ml,
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Dextrose 10% 5 mL/kg: ${toCleanNumberString(ml, 0)} mL IV slow`,
      citations: ["MCG 1309", "Drug Reference – Dextrose (1317.11)"]
    };
  },

  // Calcium Chloride 100 mg/mL, 20 mg/kg (max 1 g); note: dilute 1:1 if <1 year (~<=9 kg)
  calcium_chloride: (kg) => {
    const mg = Math.min(round(kg * 20, 0), 1000);
    const ml = round(mg / 100, 2);
    const notes: string[] = [];
    if (kg <= 9) notes.push("Dilute 1:1 with NS if <1 year");
    if (mg >= 1000) notes.push("Maximum single dose 1 gram reached");
    return {
      medicationKey: "calcium_chloride",
      displayName: "Calcium Chloride",
      route: "IV/IO",
      concentration: "100 mg/mL",
      doseMg: mg,
      doseMl: ml,
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Calcium Chloride 20 mg/kg: ${toCleanNumberString(mg, 0)} mg (${toCleanNumberString(ml)} mL) IV/IO`,
      notes,
      citations: ["MCG 1309", "Drug Reference – Calcium Chloride (1317.7)"]
    };
  },

  // Midazolam IV/IO 0.1 mg/kg or IM/IN 0.2 mg/kg (choose IV/IO unless route specified via parser)
  midazolam_ivio: (kg) => {
    const mg = round(kg * 0.1, 2);
    const ml = round(mg / 5, 2); // 5 mg/mL
    return {
      medicationKey: "midazolam_ivio",
      displayName: "Midazolam",
      route: "IV/IO",
      concentration: "5 mg/mL",
      doseMg: mg,
      doseMl: ml,
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Midazolam 0.1 mg/kg: ${toCleanNumberString(mg)} mg (${toCleanNumberString(ml)} mL) IV/IO`,
      citations: ["MCG 1309", "Drug Reference – Midazolam (1317.25)"]
    };
  },
  midazolam_inim: (kg) => {
    const mg = round(kg * 0.2, 2);
    const ml = round(mg / 5, 2); // 5 mg/mL
    return {
      medicationKey: "midazolam_inim",
      displayName: "Midazolam",
      route: "IM/IN",
      concentration: "5 mg/mL",
      doseMg: mg,
      doseMl: ml,
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Midazolam 0.2 mg/kg: ${toCleanNumberString(mg)} mg (${toCleanNumberString(ml)} mL) IM/IN`,
      citations: ["MCG 1309", "Drug Reference – Midazolam (1317.25)"]
    };
  },

  // Sodium Bicarbonate 1 mEq/mL: 1 mEq/kg
  sodium_bicarbonate: (kg) => {
    const meq = round(kg * 1, 0);
    return {
      medicationKey: "sodium_bicarbonate",
      displayName: "Sodium Bicarbonate",
      route: "IV",
      concentration: "1 mEq/mL",
      doseMg: undefined,
      doseMl: meq, // 1 mEq/mL → mL equals mEq
      doseUnits: "mEq",
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Sodium Bicarbonate 1 mEq/kg: ${toCleanNumberString(meq, 0)} mEq (${toCleanNumberString(meq, 0)} mL) IV`,
      citations: ["MCG 1309", "Drug Reference – Sodium Bicarbonate (1317.29)"]
    };
  },

  // Normal Saline bolus 20 mL/kg
  ns_bolus: (kg) => {
    const ml = round(kg * 20, 0);
    return {
      medicationKey: "ns_bolus",
      displayName: "Normal Saline Bolus",
      route: "IV",
      concentration: "—",
      doseMl: ml,
      summaryLine: `${colorForWeight(kg)} ${kg} kg — Normal Saline 20 mL/kg: ${toCleanNumberString(ml, 0)} mL IV bolus`,
      citations: ["MCG 1309"]
    };
  },
};

export class PediatricDoseCalculator {
  public static supportedKeys(): string[] {
    return Object.keys(MED_CALCULATORS);
  }

  public static calculate(input: PediatricDoseInput): PediatricDoseResult | null {
    if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) return null;
    const key = input.medicationKey.toLowerCase();
    const calculator = MED_CALCULATORS[key];
    if (!calculator) return null;
    return calculator(input.weightKg);
  }
}


