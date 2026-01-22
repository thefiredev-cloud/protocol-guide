import { Request, Response } from "express";
import { invokeClaudeSimple } from "../_core/claude";

/**
 * Ultra-concise protocol summarizer for field medics
 * Goal: One screen, no scrolling, instant comprehension
 */
export async function summarizeHandler(req: Request, res: Response) {
  try {
    const { query, content, protocolTitle } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "No content provided" });
    }

    // Ultra-concise prompt - optimized for field use
    const prompt = `You are an EMS protocol summarizer. Output MUST fit on one phone screen.

RULES:
- MAX 5 lines total
- Each line: action + dose + route (if applicable)
- Use abbreviations: IV, IO, IM, SQ, PO, mg, mcg, mL
- No explanations, no headers, no bullets
- Start with most critical action
- Include specific numbers (doses, joules, rates)

QUERY: ${query}
PROTOCOL: ${protocolTitle || "Unknown"}

CONTENT:
${content.substring(0, 4000)}

OUTPUT (5 lines max, numbered):`;

    const response = await invokeClaudeSimple({
      query: prompt,
      userTier: 'free', // Summarization always uses Haiku for speed
      systemPrompt: 'You are an EMS protocol summarizer. Be extremely concise.',
    });

    const summary = response.content;
    
    // Clean up the summary - ensure it's truly concise
    const cleanSummary = cleanupSummary(summary);
    
    res.json({ summary: cleanSummary });
  } catch (error) {
    console.error("Summarize error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
}

/**
 * Clean up LLM output to ensure ultra-concise format
 */
function cleanupSummary(text: string): string {
  if (!text) return "";
  
  // Split into lines and clean
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .slice(0, 5); // Max 5 lines
  
  // Remove any markdown or extra formatting
  const cleaned = lines.map(line => {
    return line
      .replace(/^\*\*|\*\*$/g, '') // Remove bold markers
      .replace(/^[-•]\s*/, '')     // Remove bullets
      .replace(/^\d+\.\s*/, '')    // Remove existing numbers
      .trim();
  });
  
  // Re-number
  return cleaned.map((line, i) => `${i + 1}. ${line}`).join('\n');
}
