import providerImpressions from "@/data/provider_impressions.json";
import { getKeywordWeight } from "./keyword-weights";
import { AdvancedScoringEngine, type AdvancedScoringContext } from "./advanced-scoring-engine";
import type { TriageResult } from "@/lib/triage";

type ProviderImpression = {
  pi_name: string;
  pi_code: string;
  tp_name: string;
  tp_code: string;
  tp_code_pediatric?: string;
  guidelines?: string;
  keywords?: string[];
};

export function scorePI(lowerText: string, pi: ProviderImpression): number {
  let score = 0;
  
  // Collect all keywords with multi-word phrases preserved
  const allKeywords = new Set<string>([
    ...(pi.keywords || []),
    ...pi.pi_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
    ...pi.tp_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  ]);
  
  // Score keywords with weighting
  for (const kw of allKeywords) {
    if (!kw || kw.length < 3) continue;
    
    // Check for exact keyword match
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lowerText)) {
      const weight = getKeywordWeight(kw);
      score += weight;
    }
  }
  
  // Check for multi-word keywords from the explicit keywords array
  if (pi.keywords) {
    for (const keyword of pi.keywords) {
      if (keyword.includes(' ')) {
        const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'i');
        if (regex.test(lowerText)) {
          const weight = getKeywordWeight(keyword);
          // Add weight but subtract individual word scores to avoid double-counting
          const words = keyword.toLowerCase().split(/\s+/);
          const individualScore = words.reduce((sum, word) => {
            return sum + (allKeywords.has(word) && new RegExp(`\\b${word}\\b`, 'i').test(lowerText) ? getKeywordWeight(word) : 0);
          }, 0);
          score = score - individualScore + weight;
        }
      }
    }
  }
  
  // Special scoring boost for anatomical specificity (abdominal quadrants)
  if ((/\blu[q]|ru[q]|ll[q]|rl[q]\b/.test(lowerText) || /quadrant/.test(lowerText)) && 
      /abdominal|gi|gu/.test(pi.tp_name.toLowerCase())) {
    score += 5; // High priority boost for anatomical specificity
  }
  
  return score;
}

export function topProviderImpressions(lowerText: string, triageContext?: TriageResult) {
  // Use advanced scoring if triage context available
  if (triageContext) {
    return topProviderImpressionsAdvanced(lowerText, triageContext);
  }

  // Fall back to basic scoring
  return (providerImpressions as ProviderImpression[])
    .map(pi => ({ ...pi, score: scorePI(lowerText, pi) }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(p => ({
      pi_name: p.pi_name,
      pi_code: p.pi_code,
      tp_name: p.tp_name,
      tp_code: p.tp_code,
      tp_code_pediatric: p.tp_code_pediatric,
      score: p.score
    }));
}

/**
 * Advanced scoring with demographic, vital signs, and multi-symptom pattern detection
 */
function topProviderImpressionsAdvanced(lowerText: string, triage: TriageResult) {
  const engine = new AdvancedScoringEngine();

  return (providerImpressions as ProviderImpression[])
    .map(pi => {
      // Calculate base score
      const baseScore = scorePI(lowerText, pi);

      // Collect keywords for this PI
      const allKeywords = new Set<string>([
        ...(pi.keywords || []),
        ...pi.pi_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
        ...pi.tp_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
      ]);

      // Build advanced scoring context
      const context: AdvancedScoringContext = {
        lowerText,
        demographics: {
          age: triage.age,
          sex: triage.sex,
          pregnant: triage.pregnant,
        },
        vitals: triage.vitals,
        keywords: allKeywords,
      };

      // Apply advanced scoring layers
      const advancedScore = engine.scoreProtocol(context, pi.tp_code, baseScore);

      return { ...pi, score: advancedScore };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(p => ({
      pi_name: p.pi_name,
      pi_code: p.pi_code,
      tp_name: p.tp_name,
      tp_code: p.tp_code,
      tp_code_pediatric: p.tp_code_pediatric,
      score: p.score
    }));
}


