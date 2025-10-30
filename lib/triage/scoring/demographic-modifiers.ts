/**
 * Demographic-based scoring modifiers
 * 
 * Age, sex, and pregnancy status significantly affect protocol likelihood.
 * These modifiers apply epidemiologically-based adjustments to scores.
 */

export interface DemographicProfile {
  age?: number;
  sex?: "male" | "female" | "unknown";
  pregnant?: boolean;
}

export interface ProtocolDemographicRule {
  protocolCodes: string[];
  condition: (profile: DemographicProfile) => boolean;
  multiplier: number;
  reason: string;
}

/**
 * Demographic-based protocol multipliers
 */
export const DEMOGRAPHIC_RULES: ProtocolDemographicRule[] = [
  // Pediatric protocols - only for children
  {
    protocolCodes: ["1202-P", "1203-P", "1204-P", "1205-P", "1207-P", "1209-P", "1210-P", 
                     "1211-P", "1212-P", "1213-P", "1214-P", "1215-P", "1216-P", "1217-P",
                     "1218-P", "1219-P", "1220-P", "1221-P", "1222-P", "1223-P", "1224-P",
                     "1225-P", "1226-P", "1228-P", "1229-P", "1230-P", "1231-P", "1232-P",
                     "1233-P", "1234-P", "1235-P", "1236-P", "1237-P", "1238-P", "1239-P",
                     "1240-P", "1241-P", "1242-P", "1243-P", "1244-P"],
    condition: (p) => p.age !== undefined && p.age >= 18,
    multiplier: 0.05, // Nearly eliminate adult use of pediatric protocols
    reason: "Pediatric protocol for adult patient",
  },
  {
    protocolCodes: ["1202-P", "1203-P", "1204-P", "1205-P", "1207-P", "1209-P", "1210-P", 
                     "1211-P", "1212-P", "1213-P", "1214-P", "1215-P", "1216-P", "1217-P",
                     "1218-P", "1219-P", "1220-P", "1221-P", "1222-P", "1223-P", "1224-P",
                     "1225-P", "1226-P", "1228-P", "1229-P", "1230-P", "1231-P", "1232-P",
                     "1233-P", "1234-P", "1235-P", "1236-P", "1237-P", "1238-P", "1239-P",
                     "1240-P", "1241-P", "1242-P", "1243-P", "1244-P"],
    condition: (p) => p.age !== undefined && p.age < 18,
    multiplier: 1.5, // Boost pediatric protocols for children
    reason: "Pediatric protocol for pediatric patient",
  },
  
  // OB/GYN protocols - females only
  {
    protocolCodes: ["1215", "1216-P", "1217", "1218"],
    condition: (p) => p.sex === "male",
    multiplier: 0, // Impossible for males
    reason: "OB/GYN protocol for male patient",
  },
  {
    protocolCodes: ["1215", "1217", "1218"],
    condition: (p) => p.sex === "female" && p.pregnant === true,
    multiplier: 1.8, // Strongly boost for pregnant females
    reason: "OB protocol for pregnant female",
  },
  
  // Cardiac protocols - higher risk for older males
  {
    protocolCodes: ["1211", "1211-P"],
    condition: (p) => p.sex === "male" && p.age !== undefined && p.age > 40,
    multiplier: 1.3, // Increased cardiac risk in males >40
    reason: "Cardiac protocol for high-risk demographic",
  },
  {
    protocolCodes: ["1211", "1211-P"],
    condition: (p) => p.age !== undefined && p.age > 60,
    multiplier: 1.4, // Significantly higher risk >60
    reason: "Cardiac protocol for elderly patient",
  },
  
  // Stroke protocols - higher risk with age
  {
    protocolCodes: ["1232", "1232-P"],
    condition: (p) => p.age !== undefined && p.age > 60,
    multiplier: 1.3,
    reason: "Stroke risk increases significantly with age",
  },
  {
    protocolCodes: ["1232", "1232-P"],
    condition: (p) => p.age !== undefined && p.age < 40,
    multiplier: 0.6, // Less common in young patients
    reason: "Stroke less common in young adults",
  },
  
  // Sepsis - higher risk in elderly and very young
  {
    protocolCodes: ["1204", "1204-P"],
    condition: (p) => p.age !== undefined && (p.age < 2 || p.age > 65),
    multiplier: 1.4,
    reason: "Sepsis higher risk in very young or elderly",
  },
  
  // Syncope - more concerning in elderly
  {
    protocolCodes: ["1233", "1233-P"],
    condition: (p) => p.age !== undefined && p.age > 65,
    multiplier: 1.2,
    reason: "Syncope in elderly more concerning",
  },
];

/**
 * Calculate demographic modifier for a protocol
 */
export function getDemographicModifier(
  protocolCode: string,
  profile: DemographicProfile
): number {
  let multiplier = 1.0;

  for (const rule of DEMOGRAPHIC_RULES) {
    if (rule.protocolCodes.includes(protocolCode) && rule.condition(profile)) {
      multiplier *= rule.multiplier;
    }
  }

  return multiplier;
}

