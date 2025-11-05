'use client';

import { Command, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useSettings } from '../../contexts/settings-context';

interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
}

const shortcuts: Shortcut[] = [
  { keys: ['/', 'Ctrl', 'K'], description: 'Focus search/input' },
  { keys: ['Esc'], description: 'Clear input or close dialog' },
  { keys: ['Ctrl', 'Enter'], description: 'Send message' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['n'], description: 'New conversation' },
  { keys: ['d'], description: 'Open dosing calculator' },
  { keys: ['p'], description: 'View protocols' },
  { keys: ['s'], description: 'Open settings' },
];

/**
 * Keyboard shortcuts component and handler
 * Provides keyboard navigation throughout the app
 */
export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const { openSettings } = useSettings();

  // Use ref to avoid re-registering event listener on every isOpen change
  // This prevents memory leak from accumulating event listeners
  const isOpenRef = useRef(isOpen);

  // Keep ref in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        // Except for Escape
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Show shortcuts help ( '?' and Shift + '/' )
      const isQuestionMarkShortcut = e.key === '?' || (e.key === '/' && e.shiftKey);
      if (isQuestionMarkShortcut) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Close shortcuts help - use ref to avoid re-registering listener
      if (e.key === 'Escape' && isOpenRef.current) {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      // Focus input - use ref to avoid re-registering listener
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !isOpenRef.current) {
        e.preventDefault();
        const input = document.querySelector('textarea, input[type="text"]') as HTMLElement;
        if (input) input.focus();
        return;
      }

      // Navigation shortcuts
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            window.location.href = '/';
            break;
          case 'd':
            e.preventDefault();
            window.location.href = '/dosing';
            break;
          case 'p':
            e.preventDefault();
            window.location.href = '/protocols';
            break;
          case 's':
            e.preventDefault();
            // Open settings panel via context
            openSettings();
            break;
        }
      }
    };

    // Register event listener only once on mount
    window.addEventListener('keydown', handleKeyDown);
    // Clean up on unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSettings]); // Add openSettings to dependency array

  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={() => setIsOpen(false)} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div className="shortcuts-title-row">
            <Command size={24} />
            <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="shortcuts-close" aria-label="Close shortcuts" type="button">
            <X size={24} />
          </button>
        </div>

        <div className="shortcuts-content">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <div className="shortcut-keys">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="shortcut-key">{key}</kbd>
                    {i < shortcut.keys.length - 1 && <span className="shortcut-separator">+</span>}
                  </span>
                ))}
              </div>
              <span className="shortcut-description">{shortcut.description}</span>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Press <kbd>?</kbd> anytime to view shortcuts</p>
        </div>
      </div>
    </div>
  );
}
