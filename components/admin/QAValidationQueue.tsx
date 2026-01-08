import React, { useState } from 'react';
import { QAQueueItem, updateQAStatus } from '../../lib/admin-queries';

interface QAValidationQueueProps {
  items: QAQueueItem[];
  isLoading?: boolean;
  onReviewComplete?: () => void;
  reviewerEmail: string;
}

export const QAValidationQueue: React.FC<QAValidationQueueProps> = ({
  items,
  isLoading = false,
  onReviewComplete,
  reviewerEmail,
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleReview = async (messageId: string, status: 'approved' | 'flagged' | 'escalated') => {
    setReviewingItem(messageId);
    const success = await updateQAStatus(messageId, status, reviewerEmail, reviewNotes);
    setReviewingItem(null);

    if (success) {
      setReviewNotes('');
      setExpandedItem(null);
      onReviewComplete?.();
    }
  };

  const getReasonBadge = (item: QAQueueItem) => {
    if (item.feedbackRating === 'negative') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Negative Feedback
        </span>
      );
    }
    if (item.isDeclineResponse) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
          Declined
        </span>
      );
    }
    if (item.hasWarning) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          Warning
        </span>
      );
    }
    if (item.confidenceLevel === 'LOW') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Low Confidence
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">fact_check</span>
          <h3 className="font-semibold text-slate-900 dark:text-white">QA Validation Queue</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
          {items.length} pending
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">check_circle</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">All responses reviewed</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.messageId}>
              <button
                onClick={() => setExpandedItem(expandedItem === item.messageId ? null : item.messageId)}
                className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getReasonBadge(item)}
                      {item.confidenceLevel && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.confidenceLevel === 'HIGH' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          item.confidenceLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.confidenceLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      {item.station && <span>{item.station}</span>}
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedItem === item.messageId ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
              </button>

              {/* Expanded Review Panel */}
              {expandedItem === item.messageId && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 p-4">
                  {/* Full Content */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Full Response</h4>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto">
                      {item.content}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">User</span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.userEmail || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Station</span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.station || '--'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Response Time</span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.responseTimeMs ? `${item.responseTimeMs}ms` : '--'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Grounding</span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.groundingScore !== null ? `${Math.round(item.groundingScore * 100)}%` : '--'}
                      </p>
                    </div>
                  </div>

                  {/* User Feedback */}
                  {item.feedbackText && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">User Feedback</h4>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                        {item.feedbackIssue && <span className="font-semibold">[{item.feedbackIssue}]</span>} {item.feedbackText}
                      </div>
                    </div>
                  )}

                  {/* Review Notes */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Review Notes (Optional)</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about this response..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={2}
                    />
                  </div>

                  {/* Review Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(item.messageId, 'approved')}
                      disabled={reviewingItem === item.messageId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(item.messageId, 'flagged')}
                      disabled={reviewingItem === item.messageId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">flag</span>
                      Flag
                    </button>
                    <button
                      onClick={() => handleReview(item.messageId, 'escalated')}
                      disabled={reviewingItem === item.messageId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">priority_high</span>
                      Escalate
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QAValidationQueue;
