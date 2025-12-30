'use client';

import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-soft
        border border-gray-200 dark:border-gray-700
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
