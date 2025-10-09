import providerImpressions from "@/data/provider_impressions.json";

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
  const allKeywords = new Set<string>([
    ...(pi.keywords || []),
    ...pi.pi_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
    ...pi.tp_name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  ]);
  for (const kw of allKeywords) {
    if (!kw || kw.length < 3) continue;
    if (lowerText.includes(kw)) score += 1;
  }
  if ((/\blu[q]|ru[q]|ll[q]|rl[q]\b/.test(lowerText) || /quadrant/.test(lowerText)) && /abdominal|gi|gu/.test(pi.tp_name.toLowerCase())) {
    score += 2;
  }
  return score;
}

export function topProviderImpressions(lowerText: string) {
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


