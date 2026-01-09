/**
 * AnimatedText Component
 *
 * Reveals text word-by-word with a subtle fade/blur effect.
 * Optimized for iPad performance using CSS-only animations.
 *
 * Features:
 * - Word-by-word staggered reveal
 * - Subtle blur-to-clear transition
 * - Skips animation during streaming for performance
 * - Respects prefers-reduced-motion
 */

import React, { useMemo } from 'react';

interface AnimatedTextProps {
  /** The text content to animate */
  text: string;
  /** Skip animation during streaming (render plain text) */
  isStreaming?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Stagger delay between words in ms (default: 25) */
  staggerDelay?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  isStreaming = false,
  className = '',
  staggerDelay = 25,
}) => {
  // During streaming, render plain text for performance
  if (isStreaming) {
    return <span className={className}>{text}</span>;
  }

  // Split into words while preserving whitespace
  const words = useMemo(() => {
    // Split on whitespace but keep the delimiters
    return text.split(/(\s+)/);
  }, [text]);

  // Calculate max animation time to prevent excessively long animations
  const maxDelay = Math.min(words.length * staggerDelay, 800); // Cap at 800ms total

  return (
    <span className={className}>
      {words.map((word, index) => {
        // Skip animating pure whitespace
        if (/^\s+$/.test(word)) {
          return <span key={index}>{word}</span>;
        }

        // Calculate delay, capped to prevent long waits
        const delay = Math.min(index * staggerDelay, maxDelay);

        return (
          <span
            key={index}
            className="inline-block opacity-0 animate-word-reveal will-change-[transform,opacity,filter]"
            style={{
              animationDelay: `${delay}ms`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

export default AnimatedText;
