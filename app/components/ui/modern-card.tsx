'use client';

import { useEffect, useRef } from 'react';

import { fadeInOnScroll } from '@/lib/ui/modern-features';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'glass-elevated' | 'glass-subtle' | 'glass-accent' | 'glass-blue';
  animate?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Modern card component with glassmorphism and scroll animations
 * Zero-dependency, uses native CSS features
 */
export function ModernCard({
  children,
  variant = 'glass',
  animate = true,
  className = '',
  onClick,
  style,
}: ModernCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate && cardRef.current) {
      const cleanup = fadeInOnScroll(cardRef.current);
      return cleanup;
    }
  }, [animate]);

  return (
    <div
      ref={cardRef}
      className={`${variant} ${className}`}
      onClick={onClick}
      style={{
        borderRadius: '12px',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
