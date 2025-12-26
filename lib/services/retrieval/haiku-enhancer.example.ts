/**
 * Example usage of HaikuReranker and QueryExpander
 *
 * This file demonstrates how to integrate the Haiku-based
 * retrieval enhancement into your search pipeline.
 */

import type { KBDoc } from "../../retrieval";
import { searchKB } from "../../retrieval";
import { HaikuReranker, QueryExpander } from "./haiku-enhancer";

/**
 * Example 1: Basic Query Expansion
 * Expands a user query into medical variations for better retrieval
 */
export async function exampleQueryExpansion() {
  const expander = new QueryExpander();
  const originalQuery = "heart attack";

  // Expand query into medical terminology variations
  const expandedQueries = await expander.expand(originalQuery);

  console.log("Original query:", originalQuery);
  console.log("Expanded queries:", expandedQueries);
  // Expected output:
  // ["heart attack", "myocardial infarction STEMI", "protocol 1211 cardiac chest pain", "nitroglycerin aspirin"]

  return expandedQueries;
}

/**
 * Example 2: Document Re-ranking
 * Re-ranks search results using Claude Haiku for better relevance
 */
export async function exampleReranking() {
  const reranker = new HaikuReranker();
  const query = "chest pain protocol";

  // Get initial search results
  const searchResults = await searchKB(query, 10);

  // Re-rank to top 5 most relevant
  const rerankedDocs = await reranker.rerank(query, searchResults, 5);

  console.log("Original results:", searchResults.length);
  console.log("Re-ranked top 5:", rerankedDocs.map(d => d.title));

  return rerankedDocs;
}

/**
 * Example 3: Combined Pipeline
 * Uses both query expansion and re-ranking for optimal retrieval
 */
export async function exampleCombinedPipeline(userQuery: string): Promise<KBDoc[]> {
  const expander = new QueryExpander();
  const reranker = new HaikuReranker();

  // Step 1: Expand the query
  const expandedQueries = await expander.expand(userQuery);
  console.log("Expanded queries:", expandedQueries);

  // Step 2: Search with all expanded queries
  const allResults = new Map<string, KBDoc>();
  for (const query of expandedQueries) {
    const results = await searchKB(query, 6);
    for (const doc of results) {
      allResults.set(doc.id, doc);
    }
  }

  const uniqueDocs = Array.from(allResults.values());
  console.log(`Found ${uniqueDocs.length} unique documents`);

  // Step 3: Re-rank all results
  const topDocs = await reranker.rerank(userQuery, uniqueDocs, 6);
  console.log("Final top 6 documents:", topDocs.map(d => d.title));

  return topDocs;
}

/**
 * Example 4: Integration with buildContext
 * Shows how to integrate into the existing retrieval system
 */
export async function exampleBuildContextWithEnhancement(query: string): Promise<string> {
  const expander = new QueryExpander();
  const reranker = new HaikuReranker();

  // Expand query
  const queries = await expander.expand(query);

  // Search with all variations
  const docSet = new Map<string, KBDoc>();
  for (const q of queries) {
    const results = await searchKB(q, 4);
    results.forEach(doc => docSet.set(doc.id, doc));
  }

  // Re-rank to get best results
  const docs = await reranker.rerank(query, Array.from(docSet.values()), 6);

  // Build context from top docs
  const context = docs.map((doc, i) => {
    const preview = doc.content.slice(0, 3000);
    return `#${i + 1} • ${doc.title} [${doc.category}]\n${preview}`;
  }).join("\n\n---\n\n");

  return context;
}

/**
 * Example 5: Error Handling
 * Shows graceful degradation when API is unavailable
 */
export async function exampleErrorHandling() {
  // Without API key, both classes will fall back gracefully
  const expander = new QueryExpander("");
  const reranker = new HaikuReranker("");

  const query = "seizure protocol";

  // Expansion falls back to original query
  const expanded = await expander.expand(query);
  console.log("Expanded (no API):", expanded); // ["seizure protocol"]

  // Re-ranking falls back to original order
  const docs = await searchKB(query, 10);
  const reranked = await reranker.rerank(query, docs, 5);
  console.log("Re-ranked (no API):", reranked.length); // 5 (first 5 docs)
}

// Usage in production:
//
// import { exampleCombinedPipeline } from './haiku-enhancer.example';
//
// const enhancedResults = await exampleCombinedPipeline("chest pain with shortness of breath");
