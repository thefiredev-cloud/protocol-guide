import React from 'react';
import { StationMetrics } from '../../lib/admin-queries';

interface StationBreakdownProps {
  stations: StationMetrics[];
  isLoading?: boolean;
}

export const StationBreakdown: React.FC<StationBreakdownProps> = ({
  stations,
  isLoading = false,
}) => {
  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Station Performance</h3>
        </div>
        <div className="p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">location_off</span>
          <p className="text-slate-500 dark:text-slate-400">No station data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900 dark:text-white">Station Performance</h3>
        <span className="text-xs text-slate-400">{stations.length} stations</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Station</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Queries</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Conf.</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">High</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Low</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feedback</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {stations.map((station) => {
              const totalFeedback = station.positiveFeedback + station.negativeFeedback;
              const feedbackPct = totalFeedback > 0
                ? Math.round((station.positiveFeedback / totalFeedback) * 100)
                : null;

              return (
                <tr key={station.station} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">local_fire_department</span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{station.station || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-slate-900 dark:text-white">{station.totalQueries}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {station.avgConfidence !== null ? (
                      <span className={`font-semibold ${
                        station.avgConfidence >= 0.8 ? 'text-emerald-600 dark:text-emerald-400' :
                        station.avgConfidence >= 0.5 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {Math.round(station.avgConfidence * 100)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-emerald-600 dark:text-emerald-400">{station.highConfidenceCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-red-600 dark:text-red-400">{station.lowConfidenceCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {feedbackPct !== null ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-xs font-semibold ${
                          feedbackPct >= 80 ? 'text-emerald-600' :
                          feedbackPct >= 50 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {feedbackPct}%
                        </span>
                        <span className="text-[10px] text-slate-400">({totalFeedback})</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTimeAgo(station.lastActivity)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StationBreakdown;
