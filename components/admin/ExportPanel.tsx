import React, { useState } from 'react';
import { exportConversationsCSV, DateRange } from '../../lib/admin-queries';

interface ExportPanelProps {
  isLoading?: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ isLoading = false }) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = (): DateRange => {
    const endDate = new Date();
    let startDate = new Date();

    if (dateRange === 'custom' && customStart && customEnd) {
      return {
        startDate: new Date(customStart),
        endDate: new Date(customEnd),
      };
    }

    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    return { startDate, endDate };
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const range = getDateRange();
      const csv = await exportConversationsCSV(range);

      if (!csv) {
        setError('No data to export for selected date range');
        setExporting(false);
        return;
      }

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protocol-guide-conversations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4" />
        <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded mb-4" />
        <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">download</span>
        <h3 className="font-semibold text-slate-900 dark:text-white">Export Data</h3>
      </div>

      {/* Date Range Selection */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Date Range</label>
        <div className="grid grid-cols-4 gap-2">
          {(['7d', '30d', '90d', 'custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                dateRange === range
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {range === '7d' ? '7 Days' :
               range === '30d' ? '30 Days' :
               range === '90d' ? '90 Days' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs */}
      {dateRange === 'custom' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting || (dateRange === 'custom' && (!customStart || !customEnd))}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <>
            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            Exporting...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-sm">file_download</span>
            Export to CSV
          </>
        )}
      </button>

      {/* Info */}
      <p className="mt-3 text-xs text-slate-400 text-center">
        Exports all conversations with QA/QI metrics
      </p>
    </div>
  );
};

export default ExportPanel;
