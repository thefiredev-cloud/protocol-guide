'use client';

import { type ReactNode } from 'react';

import { MaterialIcon } from './material-icon';

interface ExpandableSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function ExpandableSection({
  title,
  children,
  icon,
  defaultOpen = false,
  className = '',
}: ExpandableSectionProps) {
  return (
    <details className={`group ${className}`} open={defaultOpen}>
      <summary className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </span>
        </div>
        <MaterialIcon
          name="expand_more"
          size={20}
          className="text-gray-400 dark:text-gray-500 group-open:rotate-180 transition-transform"
        />
      </summary>
      <div className="px-4 pb-4 pt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-900/20">
        {children}
      </div>
    </details>
  );
}
