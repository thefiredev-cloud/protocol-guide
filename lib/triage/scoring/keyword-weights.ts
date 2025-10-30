/**
 * Keyword weight definitions for clinical protocol matching.
 * 
 * Critical symptoms = 10 points (life-threatening, highly specific)
 * High priority = 5 points (important clinical indicators)
 * Moderate = 2 points (relevant symptoms/conditions)
 * Low = 0.5 points (general terms, less specific)
 */

export type KeywordWeight = "critical" | "high" | "moderate" | "low";

export interface WeightedKeywordMap {
  [keyword: string]: KeywordWeight;
}

/**
 * Clinical keyword weights for protocol matching.
 * These weights help prioritize critical symptoms over general terms.
 */
export const KEYWORD_WEIGHTS: WeightedKeywordMap = {
  // Critical life-threatening symptoms (10 points)
  "stridor": "critical",
  "apnea": "critical",
  "pulseless": "critical",
  "unresponsive": "critical",
  "not breathing": "critical",
  "respiratory arrest": "critical",
  "cardiac arrest": "critical",
  "anaphylaxis": "critical",
  "anaphylactic": "critical",
  "code": "critical",
  "CPR": "critical",
  "status epilepticus": "critical",
  "agonal breathing": "critical",
  "airway swelling": "critical",
  "throat swelling": "critical",
  
  // High priority symptoms (5 points)
  "chest pain": "high",
  "seizure": "high",
  "seizing": "high",
  "stroke": "high",
  "CVA": "high",
  "STEMI": "high",
  "myocardial infarction": "high",
  "respiratory failure": "high",
  "shock": "high",
  "hypoperfusion": "high",
  "poor perfusion": "high",
  "sepsis": "high",
  "septic": "high",
  "overdose": "critical",
  "poisoning": "critical",
  "opioid": "high",
  "naloxone": "high",
  "narcan": "high",
  "OD": "high",
  "inhalation": "high",
  "inhaled": "high",
  "gas": "high",
  "fumes": "high",
  "hoarse": "high",
  "hoarseness": "high",
  "drowning": "critical",
  "drowned": "critical",
  "submersion": "critical",
  "near drowning": "critical",
  "water rescue": "high",
  "crush injury": "high",
  "crush syndrome": "high",
  "rhabdomyolysis": "high",
  "entrapment": "high",
  "angioedema": "high",
  "facial droop": "high",
  "arm weakness": "high",
  "speech difficulty": "high",
  
  // Moderate symptoms (2 points)
  "shortness of breath": "moderate",
  "SOB": "moderate",
  "dyspnea": "moderate",
  "difficulty breathing": "moderate",
  "wheezing": "moderate",
  "asthma": "moderate",
  "COPD": "moderate",
  "bronchospasm": "moderate",
  "CHF": "moderate",
  "pulmonary edema": "moderate",
  "hypoglycemia": "high",
  "hypoglycemic": "high",
  "low blood sugar": "high",
  "low glucose": "high",
  "glucose 45": "critical",
  "glucose 50": "critical",
  "glucose 55": "high",
  "syncope": "moderate",
  "fainted": "moderate",
  "passed out": "moderate",
  "allergic": "moderate",
  "allergy": "moderate",
  "hives": "moderate",
  "urticaria": "moderate",
  "burns": "moderate",
  "burned": "moderate",
  "thermal": "moderate",
  "fire": "moderate",
  "smoke": "moderate",
  "carbon monoxide": "moderate",
  "bradycardia": "high",
  "slow heart rate": "high",
  "HR 40": "critical",
  "HR 42": "critical",
  "HR 45": "critical",
  "tachycardia": "moderate",
  "hypotension": "moderate",
  "low blood pressure": "moderate",
  "nausea": "moderate",
  "vomiting": "moderate",
  "abdominal pain": "moderate",
  "fever": "moderate",
  "hypothermia": "moderate",
  "hyperthermia": "moderate",
  "heat stroke": "moderate",
  "altered": "moderate",
  "confusion": "moderate",
  "lethargic": "moderate",
  "cough": "moderate",
  "toxic": "moderate",
  "exposure": "moderate",
  
  // Low value terms (0.5 points)
  "patient": "low",
  "injury": "low",
  "pain": "low",
  "medical": "low",
  "emergency": "low",
  "complaint": "low",
  "trauma": "low",
  "problem": "low",
  "distress": "low",
};

/**
 * Get weight value for keyword
 */
export function getKeywordWeight(keyword: string): number {
  const weight = KEYWORD_WEIGHTS[keyword.toLowerCase()];
  switch (weight) {
    case "critical":
      return 10;
    case "high":
      return 5;
    case "moderate":
      return 2;
    case "low":
      return 0.5;
    default:
      // Default weight for unlisted keywords
      return 1;
  }
}

