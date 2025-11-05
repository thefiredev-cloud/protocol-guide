/**
 * Modern UI Features - Native Browser APIs
 * Zero-dependency utilities for next-generation web platform features
 *
 * Features:
 * - View Transitions API (Chrome 111+, Safari 18+)
 * - Scroll-driven Animations (Chrome 115+)
 * - Native page transitions
 * - Progressive enhancement fallbacks
 */

// ============================================================================
// VIEW TRANSITIONS API
// ============================================================================

interface ViewTransitionAPI {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
}

/**
 * Check if View Transitions API is supported
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/**
 * Navigate with View Transition animation
 * Provides smooth page transitions without libraries
 *
 * @example
 * ```tsx
 * <Link onClick={() => navigateWithTransition('/protocols')}>
 *   View Protocols
 * </Link>
 * ```
 */
export function navigateWithTransition(url: string): void {
  if (supportsViewTransitions()) {
    const doc = document as Document & ViewTransitionAPI;
    doc.startViewTransition?.(() => {
      window.location.href = url;
    });
  } else {
    // Graceful fallback for unsupported browsers
    window.location.href = url;
  }
}

/**
 * Transition between states with animation
 * Useful for dynamic content changes
 *
 * @example
 * ```tsx
 * await transitionState(async () => {
 *   setMessages([...messages, newMessage]);
 * });
 * ```
 */
export async function transitionState(callback: () => void | Promise<void>): Promise<void> {
  if (supportsViewTransitions()) {
    const doc = document as Document & ViewTransitionAPI;
    const transition = doc.startViewTransition?.(callback);
    await transition?.finished;
  } else {
    // Execute callback without transition
    await Promise.resolve(callback());
  }
}

/**
 * Add view transition name to element for targeted animations
 *
 * @example
 * ```tsx
 * <div ref={(el) => el && setViewTransitionName(el, 'chat-message-123')}>
 *   Message content
 * </div>
 * ```
 */
export function setViewTransitionName(element: HTMLElement, name: string): void {
  if (supportsViewTransitions()) {
    element.style.viewTransitionName = name;
  }
}

// ============================================================================
// SCROLL-DRIVEN ANIMATIONS
// ============================================================================

/**
 * Check if scroll-driven animations are supported
 */
export function supportsScrollTimeline(): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('animation-timeline', 'scroll()') ||
         CSS.supports('animation-timeline', 'view()');
}

/**
 * Apply scroll-driven animation to element
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const el = ref.current;
 *   if (el) {
 *     applyScrollAnimation(el, {
 *       animation: 'fadeSlideUp',
 *       timeline: 'view',
 *       range: 'entry 0% cover 30%'
 *     });
 *   }
 * }, []);
 * ```
 */
export interface ScrollAnimationOptions {
  animation: string;
  timeline: 'scroll' | 'view';
  range?: string;
  axis?: 'block' | 'inline' | 'x' | 'y';
}

export function applyScrollAnimation(
  element: HTMLElement,
  options: ScrollAnimationOptions
): void {
  if (!supportsScrollTimeline()) return;

  const { animation, timeline, range = 'entry 0% cover 50%', axis = 'block' } = options;

  element.style.animation = `${animation} linear`;
  (element.style as unknown as Record<string, string>).animationTimeline = timeline === 'view' ? 'view()' : `scroll(${axis})`;

  if (timeline === 'view' && range) {
    (element.style as unknown as Record<string, string>).animationRange = range;
  }
}

/**
 * Create scroll progress tracker element
 * Returns element that fills horizontally based on scroll position
 *
 * @example
 * ```tsx
 * const progressBar = createScrollProgressIndicator('root');
 * document.body.appendChild(progressBar);
 * ```
 */
export function createScrollProgressIndicator(scrollerAxis: 'root' | 'nearest' = 'root'): HTMLElement {
  const indicator = document.createElement('div');
  indicator.className = 'scroll-progress-indicator';

  if (supportsScrollTimeline()) {
    const style = indicator.style as unknown as Record<string, string>;
    style.animation = 'scroll-progress linear';
    style.animationTimeline = `scroll(${scrollerAxis})`;
  }

  return indicator;
}

// ============================================================================
// POPOVER API
// ============================================================================

/**
 * Check if Popover API is supported
 */
export function supportsPopover(): boolean {
  if (typeof HTMLElement === 'undefined') return false;
  return 'popover' in HTMLElement.prototype;
}

/**
 * Create programmatic popover
 *
 * @example
 * ```tsx
 * const popover = createPopover({
 *   content: <MedicationDetails drug="Epinephrine" />,
 *   trigger: buttonElement,
 *   placement: 'top'
 * });
 * ```
 */
export interface PopoverOptions {
  content: string | HTMLElement;
  trigger?: HTMLElement;
  mode?: 'auto' | 'manual';
  className?: string;
}

export function createPopover(options: PopoverOptions): HTMLElement {
  const { content, mode = 'auto', className = '' } = options;

  const popover = document.createElement('div');
  popover.className = `popover ${className}`;

  if (supportsPopover()) {
    (popover as HTMLElement & { popover: string }).popover = mode;
  }

  if (typeof content === 'string') {
    popover.innerHTML = content;
  } else {
    popover.appendChild(content);
  }

  return popover;
}

/**
 * Toggle popover programmatically
 */
export function togglePopover(popover: HTMLElement, force?: boolean): void {
  if (supportsPopover() && 'togglePopover' in popover) {
    (popover as HTMLElement & { togglePopover: (force?: boolean) => void }).togglePopover(force);
  } else {
    // Fallback: toggle display
    if (force !== undefined) {
      popover.style.display = force ? 'block' : 'none';
    } else {
      popover.style.display = popover.style.display === 'none' ? 'block' : 'none';
    }
  }
}

// ============================================================================
// CONTAINER QUERIES
// ============================================================================

/**
 * Check if Container Queries are supported
 */
export function supportsContainerQueries(): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('container-type', 'inline-size');
}

/**
 * Apply container query properties to element
 */
export function makeContainer(element: HTMLElement, type: 'size' | 'inline-size' | 'normal' = 'inline-size'): void {
  if (supportsContainerQueries()) {
    const style = element.style as unknown as Record<string, string>;
    style.containerType = type;
  }
}

// ============================================================================
// INTERSECTION OBSERVER (for fallbacks)
// ============================================================================

/**
 * Fallback animation trigger using Intersection Observer
 * Used when scroll-driven animations aren't supported
 */
export function observeForAnimation(
  element: HTMLElement,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
}

/**
 * Apply fade-in animation when element enters viewport (fallback)
 */
export function fadeInOnScroll(element: HTMLElement): () => void {
  if (supportsScrollTimeline()) {
    // Use native scroll-driven animation
    applyScrollAnimation(element, {
      animation: 'fadeSlideUp',
      timeline: 'view',
      range: 'entry 0% cover 30%'
    });
    return () => {};
  }

  // Fallback to Intersection Observer
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

  return observeForAnimation(element, (entry) => {
    if (entry.isIntersecting) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

// ============================================================================
// BROWSER CAPABILITY DETECTION
// ============================================================================

/**
 * Get all supported modern features
 * Useful for debugging and feature detection
 */
export function getSupportedFeatures() {
  return {
    viewTransitions: supportsViewTransitions(),
    scrollTimeline: supportsScrollTimeline(),
    popover: supportsPopover(),
    containerQueries: supportsContainerQueries(),
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
  };
}

/**
 * Log supported features to console (dev mode only)
 */
export function logSupportedFeatures(): void {
  if (process.env.NODE_ENV === 'development') {
    const features = getSupportedFeatures();
    // eslint-disable-next-line no-console
    console.log('🎨 Modern UI Features Support:', features);
  }
}
