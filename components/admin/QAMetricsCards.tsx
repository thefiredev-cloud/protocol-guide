import React from 'react';
import { DailyMetrics, ConfidenceDistribution } from '../../lib/admin-queries';

interface QAMetricsCardsProps {
  dailyMetrics: DailyMetrics[];
  confidenceDistribution: ConfidenceDistribution;
  isLoading?: boolean;
}

export const QAMetricsCards: React.FC<QAMetricsCardsProps> = ({
  dailyMetrics,
  confidenceDistribution,
  isLoading = false,
}) => {
  // Aggregate today's metrics
  const todayMetrics = dailyMetrics.length > 0 ? dailyMetrics[0] : null;

  // Calculate totals from last 7 days
  const last7Days = dailyMetrics.slice(0, 7);
  const totalQueries = last7Days.reduce((sum, d) => sum + d.userQueries, 0);
  const totalResponses = last7Days.reduce((sum, d) => sum + d.aiResponses, 0);
  const avgResponseTime = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, d) => sum + (d.avgResponseTimeMs || 0), 0) / last7Days.length)
    : 0;
  const totalDeclines = last7Days.reduce((sum, d) => sum + d.declineCount, 0);
  const totalWarnings = last7Days.reduce((sum, d) => sum + d.warningCount, 0);

  // Calculate confidence percentages
  const confTotal = confidenceDistribution.total || 1;
  const highPct = Math.round((confidenceDistribution.high / confTotal) * 100);
  const medPct = Math.round((confidenceDistribution.medium / confTotal) * 100);
  const lowPct = Math.round((confidenceDistribution.low / confTotal) * 100);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Today's Queries */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">question_answer</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{todayMetrics?.userQueries || 0}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Today's Queries</p>
      </div>

      {/* 7-Day Total */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">trending_up</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalQueries}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">7-Day Queries</p>
      </div>

      {/* Avg Response Time */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400">speed</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgResponseTime}ms</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Avg Response</p>
      </div>

      {/* Unique Users Today */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-600 dark:text-violet-400">person</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{todayMetrics?.uniqueUsers || 0}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Active Users</p>
      </div>

      {/* High Confidence */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">verified</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{highPct}%</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">High Confidence</p>
      </div>

      {/* Medium Confidence */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">help</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{medPct}%</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Medium Conf.</p>
      </div>

      {/* Declines */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">block</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDeclines}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Declines (7d)</p>
      </div>

      {/* Warnings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">warning</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalWarnings}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Warnings (7d)</p>
      </div>
    </div>
  );
};

export default QAMetricsCards;
