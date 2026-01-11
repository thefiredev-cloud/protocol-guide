/**
 * QuickResults Component
 *
 * Shows top 3 matching protocols from local bundled data immediately (0-200ms)
 * while the AI processes the query. Provides instant value to field users.
 */

import React from 'react';

export interface LocalSearchResult {
  protocolRef: string;
  title: string;
  category: string;
  matchedContent: string;
  score: number;
}

interface QuickResultsProps {
  results: LocalSearchResult[];
  onProtocolClick: (protocolRef: string) => void;
  isVisible: boolean;
  isFading?: boolean;
}

export const QuickResults: React.FC<QuickResultsProps> = ({
  results,
  onProtocolClick,
  isVisible,
  isFading = false
}) => {
  if (!isVisible || results.length === 0) return null;

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 border border-blue-200 dark:border-blue-800/30 transition-opacity duration-300 ${
      isFading ? 'opacity-0' : 'opacity-100 animate-fadeIn'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-blue-500 text-lg">bolt</span>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Quick Reference
        </span>
        <span className="text-[10px] text-blue-500/70 dark:text-blue-400/50">
          (while AI processes)
        </span>
      </div>

      <div className="space-y-2">
        {results.slice(0, 3).map((result) => (
          <button
            key={result.protocolRef}
            onClick={() => onProtocolClick(result.protocolRef)}
            className="block w-full text-left p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-blue-100 dark:border-blue-800/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                {result.protocolRef}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                {result.category}
              </span>
            </div>
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {result.title}
            </div>
            {result.matchedContent && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {result.matchedContent}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 text-[10px] text-blue-500/70 dark:text-blue-400/50 text-center">
        Tap to view full protocol • AI response loading...
      </div>
    </div>
  );
};

/**
 * Extract relevant content snippet from protocol for preview
 */
export function extractRelevantSnippet(protocol: any, query: string): string {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  // Search through sections for matching content
  for (const section of protocol.sections || []) {
    const content = section.content || '';
    const items = section.items || [];

    // Check main content
    const contentLower = content.toLowerCase();
    for (const term of terms) {
      if (contentLower.includes(term)) {
        // Extract surrounding context
        const idx = contentLower.indexOf(term);
        const start = Math.max(0, idx - 30);
        const end = Math.min(content.length, idx + term.length + 50);
        return content.substring(start, end).replace(/<[^>]+>/g, '').trim() + '...';
      }
    }

    // Check items
    for (const item of items) {
      const itemContent = (item.title || '') + ' ' + (item.content || '');
      const itemLower = itemContent.toLowerCase();
      for (const term of terms) {
        if (itemLower.includes(term)) {
          return itemContent.replace(/<[^>]+>/g, '').substring(0, 80).trim() + '...';
        }
      }
    }
  }

  return '';
}

export default QuickResults;
