import { describe, expect, it } from 'vitest';

import { topProviderImpressions } from '../../lib/triage/scoring/providerImpressionScoring';

describe('triage scoring', () => {
  it('returns top provider impressions based on keywords', () => {
    const text = 'Patient with chest pain radiating to left arm, consider ACS/STEMI';
    const lower = text.toLowerCase();
    const top = topProviderImpressions(lower);
    expect(top.length).toBeGreaterThan(0);
    // Ensure results contain tp_name / tp_code shape
    expect(top[0]).toHaveProperty('tp_name');
    expect(top[0]).toHaveProperty('tp_code');
  });
});


