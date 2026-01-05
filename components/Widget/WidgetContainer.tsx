import React, { useEffect, useRef } from 'react';
import { useWidgetMode } from '../../contexts/WidgetModeContext';

interface WidgetContainerProps {
  children: React.ReactNode;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ children }) => {
  const { isExpanded, collapse } = useWidgetMode();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        collapse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, collapse]);

  // Focus trap and scroll lock when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      containerRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-[9990]
          bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={collapse}
        aria-hidden="true"
      />

      {/* Widget Panel */}
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Protocol Guide"
        className={`
          fixed z-[9995]
          bg-background-light dark:bg-background-dark
          shadow-2xl
          transition-all duration-300 ease-out

          /* Desktop: Right-side panel */
          sm:right-6 sm:bottom-24 sm:top-6
          sm:w-[420px] sm:max-w-[calc(100vw-48px)]
          sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-slate-700

          /* Mobile: Full screen when expanded */
          inset-0 sm:inset-auto

          ${isExpanded
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none sm:translate-x-[120%]'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Protocol Guide"
              className="w-8 h-8 bg-white rounded-lg p-0.5"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">ProtocolGuide</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">LA County EMS</p>
            </div>
          </div>

          <button
            onClick={collapse}
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       hover:bg-slate-100 dark:hover:bg-slate-700
                       transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-56px)] overflow-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
};

export default WidgetContainer;
