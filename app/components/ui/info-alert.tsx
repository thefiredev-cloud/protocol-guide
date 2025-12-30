'use client';

import { type ReactNode } from 'react';

import { MaterialIcon } from './material-icon';

type AlertVariant = 'info' | 'warning' | 'error' | 'success';

interface InfoAlertProps {
  title: string;
  children: ReactNode;
  variant?: AlertVariant;
  icon?: string;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; icon: string; title: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-300',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-800 dark:text-yellow-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-800 dark:text-red-300',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-800 dark:text-green-300',
  },
};

const defaultIcons: Record<AlertVariant, string> = {
  info: 'verified',
  warning: 'warning',
  error: 'error',
  success: 'check_circle',
};

export function InfoAlert({
  title,
  children,
  variant = 'info',
  icon,
  className = '',
}: InfoAlertProps) {
  const styles = variantStyles[variant];
  const iconName = icon ?? defaultIcons[variant];

  return (
    <div className={`rounded-2xl p-4 border ${styles.bg} ${className}`}>
      <div className="flex gap-3">
        <MaterialIcon name={iconName} className={`shrink-0 ${styles.icon}`} />
        <div>
          <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>{title}</h3>
          <div className="text-sm leading-normal">{children}</div>
        </div>
      </div>
    </div>
  );
}
