import React from 'react';
import { ConfidenceDistribution } from '../../lib/admin-queries';

interface ConfidenceChartProps {
  distribution: ConfidenceDistribution;
  isLoading?: boolean;
}

export const ConfidenceChart: React.FC<ConfidenceChartProps> = ({
  distribution,
  isLoading = false,
}) => {
  const total = distribution.total || 1;
  const highPct = Math.round((distribution.high / total) * 100);
  const medPct = Math.round((distribution.medium / total) * 100);
  const lowPct = Math.round((distribution.low / total) * 100);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4" />
        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-slate-100 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Response Confidence Distribution</h3>

      {/* Visual Bar */}
      <div className="h-8 rounded-lg overflow-hidden flex mb-4">
        {highPct > 0 && (
          <div
            className="bg-emerald-500 flex items-center justify-center transition-all"
            style={{ width: `${highPct}%` }}
          >
            {highPct >= 15 && (
              <span className="text-xs font-bold text-white">{highPct}%</span>
            )}
          </div>
        )}
        {medPct > 0 && (
          <div
            className="bg-amber-500 flex items-center justify-center transition-all"
            style={{ width: `${medPct}%` }}
          >
            {medPct >= 15 && (
              <span className="text-xs font-bold text-white">{medPct}%</span>
            )}
          </div>
        )}
        {lowPct > 0 && (
          <div
            className="bg-red-500 flex items-center justify-center transition-all"
            style={{ width: `${lowPct}%` }}
          >
            {lowPct >= 15 && (
              <span className="text-xs font-bold text-white">{lowPct}%</span>
            )}
          </div>
        )}
        {total === 0 && (
          <div className="bg-slate-200 dark:bg-slate-700 w-full flex items-center justify-center">
            <span className="text-xs text-slate-500">No data</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">High Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{distribution.high}</span>
            <span className="text-xs text-slate-400">({highPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Medium Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{distribution.medium}</span>
            <span className="text-xs text-slate-400">({medPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Low Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{distribution.low}</span>
            <span className="text-xs text-slate-400">({lowPct}%)</span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total Responses</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{distribution.total}</span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceChart;
