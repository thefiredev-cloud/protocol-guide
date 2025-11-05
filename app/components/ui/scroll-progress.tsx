'use client';

import { useEffect, useRef } from 'react';

import { createScrollProgressIndicator, supportsScrollTimeline } from '@/lib/ui/modern-features';

/**
 * Scroll progress indicator component
 * Shows read progress at top of page
 */
export function ScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const indicator = createScrollProgressIndicator('root');
    containerRef.current.appendChild(indicator);

    // Fallback for browsers without scroll-timeline support
    if (!supportsScrollTimeline()) {
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        indicator.style.width = `${scrollPercent}%`;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        indicator.remove();
      };
    }

    return () => indicator.remove();
  }, []);

  return <div ref={containerRef} />;
}
