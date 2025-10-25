'use client';

import { useEffect } from 'react';

/**
 * Web Vitals monitoring component
 * Tracks Core Web Vitals and sends to analytics
 */
export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import web-vitals to reduce bundle size
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(sendToAnalytics);
      onINP(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    }).catch(() => {
      // Gracefully handle if web-vitals fails to load
      console.warn('Web vitals monitoring failed to load');
    });
  }, []);

  return null; // This component doesn't render anything
}

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta),
    });
  }

  // Send to analytics endpoint
  if (navigator.sendBeacon) {
    const body = JSON.stringify({
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta),
      id: metric.id,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    navigator.sendBeacon('/api/metrics', body);
  }

  // Alternative: send via fetch for older browsers
  if (!navigator.sendBeacon) {
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true,
    }).catch(() => {
      // Fail silently - analytics shouldn't break the app
    });
  }
}
