import { describe, expect, it } from 'vitest';

import { PromptBuilder } from '../../lib/prompt/PromptBuilder';

describe('PromptBuilder', () => {
  it('builds a non-empty system prompt that includes key sections', () => {
    const prompt = new PromptBuilder().build();
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('Core Guardrails');
    expect(prompt).toContain('Response Format');
    expect(prompt).toContain('Special Handling');
    expect(prompt).toContain('Out-of-Scope Refusal');
  });
});


