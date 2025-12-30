'use client';

import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'blue' | 'purple' | 'orange' | 'green';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-[10px] font-bold uppercase tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
