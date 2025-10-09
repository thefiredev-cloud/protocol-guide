/**
 * Example usage of ChunkedKnowledgeBaseManager
 *
 * This file demonstrates how to integrate the chunked KB into your application.
 * The chunked KB system provides:
 * - 98.9% reduction in initial load (10.62 MB → ~117 KB)
 * - Lazy loading of large chunks on demand
 * - IndexedDB caching for offline access
 * - Service Worker caching for performance
 */

import { getChunkedKB } from './knowledge-base-chunked';

/**
 * Example 1: Initialize and preload essential chunks
 * Call this during app startup
 */
export async function initializeKnowledgeBase() {
  const kb = await getChunkedKB();

  // Preload essential chunks (medication, protocol, clinical decision support)
  // This loads ~117 KB instead of 10.62 MB
  await kb.preloadEssentialChunks();

  console.log('KB initialized with essential chunks');
  console.log(kb.getStats());
}

/**
 * Example 2: Search with automatic chunk loading
 * The KB will automatically load relevant chunks based on the query
 */
export async function searchKnowledgeBase(query: string, categories?: string[]) {
  const kb = await getChunkedKB();

  // Search will automatically load chunks if not already loaded
  const results = await kb.search(query, categories);

  console.log(`Found ${results.length} results for: ${query}`);
  return results;
}

/**
 * Example 3: Search with category filtering
 * Only loads the specified category chunks
 */
export async function searchMedications(query: string) {
  const kb = await getChunkedKB();

  // This will only load the Medication chunk (~86 KB) if not already loaded
  const results = await kb.search(query, ['Medication']);

  return results;
}

/**
 * Example 4: Get all documents from a category
 * Useful for displaying category-specific content
 */
export async function getMedicationDocs() {
  const kb = await getChunkedKB();

  // This will load the Medication chunk if not already loaded
  const docs = await kb.getDocuments('Medication');

  return docs;
}

/**
 * Example 5: Load large chunks on-demand
 * Only load the 10 MB markdown chunk when actually needed
 */
export async function searchProtocolDocumentation(query: string) {
  const kb = await getChunkedKB();

  // This will load the large Markdown chunk only when needed
  const results = await kb.search(query, ['Markdown']);

  return results;
}

/**
 * Example 6: Check what's loaded
 */
export async function getKBStats() {
  const kb = await getChunkedKB();
  return kb.getStats();
}

/**
 * Example 7: Clear cache (useful for troubleshooting or forced refresh)
 */
export async function clearKBCache() {
  const kb = await getChunkedKB();
  await kb.clearCache();
  console.log('KB cache cleared');
}

/**
 * Example Integration in API Route
 *
 * Replace your current knowledge base initialization:
 *
 * BEFORE:
 * ```typescript
 * import { KnowledgeBaseManager } from '@/lib/storage/knowledge-base-manager';
 * const kb = await KnowledgeBaseManager.initialize(); // Loads 10.62 MB
 * const results = await kb.search(query);
 * ```
 *
 * AFTER:
 * ```typescript
 * import { getChunkedKB } from '@/lib/storage/knowledge-base-chunked';
 * const kb = await getChunkedKB(); // Loads only manifest + essential (~117 KB)
 * await kb.preloadEssentialChunks();
 * const results = await kb.search(query, ['Medication', 'Protocol']); // Loads only needed chunks
 * ```
 */

/**
 * Example Integration in React Component
 *
 * ```typescript
 * import { useEffect, useState } from 'react';
 * import { getChunkedKB } from '@/lib/storage/knowledge-base-chunked';
 *
 * export function ProtocolSearch() {
 *   const [results, setResults] = useState([]);
 *   const [loading, setLoading] = useState(false);
 *
 *   const handleSearch = async (query: string) => {
 *     setLoading(true);
 *     const kb = await getChunkedKB();
 *     const searchResults = await kb.search(query, ['Protocol', 'Medication']);
 *     setResults(searchResults);
 *     setLoading(false);
 *   };
 *
 *   useEffect(() => {
 *     // Preload essential chunks on component mount
 *     getChunkedKB().then(kb => kb.preloadEssentialChunks());
 *   }, []);
 *
 *   return (
 *     // Your component JSX
 *   );
 * }
 * ```
 */

/**
 * Migration Guide:
 *
 * 1. Replace imports:
 *    - FROM: '@/lib/storage/knowledge-base-manager'
 *    - TO: '@/lib/storage/knowledge-base-chunked'
 *
 * 2. Update initialization:
 *    - FROM: `const kb = await KnowledgeBaseManager.initialize()`
 *    - TO: `const kb = await getChunkedKB()`
 *
 * 3. Add preloading:
 *    - `await kb.preloadEssentialChunks()`
 *
 * 4. Update search calls:
 *    - Add category filtering where appropriate
 *    - Example: `kb.search(query, ['Medication', 'Protocol'])`
 *
 * 5. Monitor performance:
 *    - Check `kb.getStats()` to see what chunks are loaded
 *    - Use browser DevTools to verify reduced initial load
 *
 * 6. Update service worker:
 *    - Already updated in public/sw.js
 *    - Manifest and chunks are now cached separately
 */
