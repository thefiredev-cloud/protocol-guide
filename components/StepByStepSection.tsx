import React from 'react';
import DOMPurify from 'dompurify';
import { ProcedureStep } from '../types';
import { ProtocolImage } from './ProtocolImage';

interface StepByStepSectionProps {
  title?: string;
  steps: ProcedureStep[];
  color?: string;
}

const sanitizeHTML = (html: string | undefined): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
};

const getColorClasses = (color: string = 'blue') => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200' },
  };
  return colors[color] || colors.blue;
};

export const StepByStepSection: React.FC<StepByStepSectionProps> = ({
  title,
  steps,
  color = 'blue'
}) => {
  const colorClasses = getColorClasses(color);

  return (
    <div className="mb-8">
      {title && (
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className={`material-symbols-outlined ${colorClasses.text}`}>format_list_numbered</span>
          {title}
        </h3>
      )}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`border-b border-slate-100 dark:border-slate-700 last:border-0 ${
              index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'
            }`}
          >
            {/* Step Header */}
            <div className="flex items-start gap-4 p-4 pb-2">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClasses.bg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                {step.stepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-900 dark:text-white">{step.title}</h4>
                  {step.duration && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-xs">timer</span>
                      {step.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="px-4 pb-4 pl-16">
              {/* Step Image */}
              {step.imageUrl && (
                <div className="mb-3">
                  <ProtocolImage
                    src={step.imageUrl}
                    alt={step.imageAlt || step.title}
                    expandable={true}
                  />
                </div>
              )}

              {/* Description - sanitized with DOMPurify for XSS protection */}
              <div
                className="text-sm text-slate-600 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(step.description) }}
              />

              {/* Substeps */}
              {step.substeps && step.substeps.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {step.substeps.map((substep, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">chevron_right</span>
                      {substep}
                    </li>
                  ))}
                </ul>
              )}

              {/* Warning Callout */}
              {step.warning && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg flex-shrink-0">warning</span>
                  <p className="text-sm text-amber-800 dark:text-amber-200">{step.warning}</p>
                </div>
              )}

              {/* Tip Callout */}
              {step.tip && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg flex-shrink-0">lightbulb</span>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{step.tip}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
