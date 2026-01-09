import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface FeedbackButtonsProps {
  messageId: string;
  query: string;
  response: string;
  onFeedbackSubmit?: (rating: 'positive' | 'negative') => void;
}

type IssueType = 'incorrect_info' | 'missing_info' | 'outdated' | 'unclear' | 'other';

const ISSUE_TYPES: { value: IssueType; label: string }[] = [
  { value: 'incorrect_info', label: 'Incorrect information' },
  { value: 'missing_info', label: 'Missing information' },
  { value: 'outdated', label: 'Outdated protocol' },
  { value: 'unclear', label: 'Response unclear' },
  { value: 'other', label: 'Other issue' },
];

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  messageId,
  query,
  response,
  onFeedbackSubmit,
}) => {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const submitFeedback = async (feedbackRating: 'positive' | 'negative', details?: { issueType?: string; text?: string }) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('user_feedback').insert({
        user_id: user?.id,
        message_id: messageId,
        rating: feedbackRating,
        issue_type: details?.issueType || null,
        feedback_text: details?.text || null,
        query: query.slice(0, 1000), // Limit stored query length
        response: response.slice(0, 2000), // Limit stored response length
      });

      if (error) {
        console.error('Failed to submit feedback:', error);
        setSubmitError(true);
        return;
      }

      setRating(feedbackRating);
      setSubmitted(true);
      onFeedbackSubmit?.(feedbackRating);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const handlePositive = () => {
    submitFeedback('positive');
  };

  const handleNegative = () => {
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    submitFeedback('negative', {
      issueType: issueType || undefined,
      text: feedbackText || undefined,
    });
  };

  if (submitError) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400 mt-2">
        <span className="material-symbols-outlined text-[14px]">error</span>
        <span>Failed to submit feedback</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-2">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        <span>Thanks for your feedback</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">Helpful?</span>
        <button
          onClick={handlePositive}
          disabled={isSubmitting}
          className={`p-1.5 rounded-lg transition-all ${
            rating === 'positive'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500'
          }`}
          title="Yes, this was helpful"
        >
          <span className="material-symbols-outlined text-[16px]">thumb_up</span>
        </button>
        <button
          onClick={handleNegative}
          disabled={isSubmitting}
          className={`p-1.5 rounded-lg transition-all ${
            rating === 'negative'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500'
          }`}
          title="Report an issue"
        >
          <span className="material-symbols-outlined text-[16px]">thumb_down</span>
        </button>
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">flag</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Report Issue</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Help us improve accuracy</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  What was wrong?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ISSUE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setIssueType(type.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        issueType === type.value
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Please describe what was incorrect or missing..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{feedbackText.length}/500</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButtons;
