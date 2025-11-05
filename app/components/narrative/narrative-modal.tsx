'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { NarrativeData } from '../../types/narrative';

interface NarrativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  narrativeData: NarrativeData | null;
  isLoading: boolean;
}

/**
 * Mobile-friendly narrative modal
 * Displays protocol responses and narrative as a bottom sheet overlay
 */
export function NarrativeModal({
  isOpen,
  onClose,
  narrativeData,
  isLoading,
}: NarrativeModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="narrative-modal-backdrop"
        onClick={handleClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`narrative-modal ${isAnimating ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="narrative-modal-title"
      >
        {/* Modal Header */}
        <div className="narrative-modal-header">
          <h2 id="narrative-modal-title" className="narrative-modal-title">
            Protocol Response
          </h2>
          <button
            className="narrative-modal-close"
            onClick={handleClose}
            aria-label="Close narrative panel"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="narrative-modal-content">
          {isLoading ? (
            <div className="narrative-modal-loading">
              <div className="loading-spinner" />
              <p>Loading protocol response...</p>
            </div>
          ) : narrativeData ? (
            <div className="narrative-modal-body">
              {/* Display narrative sections */}
              {narrativeData.chief_complaint && (
                <section className="narrative-section">
                  <h3>Chief Complaint</h3>
                  <p>{narrativeData.chief_complaint}</p>
                </section>
              )}

              {narrativeData.assessment && (
                <section className="narrative-section">
                  <h3>Assessment</h3>
                  <p>{narrativeData.assessment}</p>
                </section>
              )}

              {narrativeData.interventions && (
                <section className="narrative-section">
                  <h3>Interventions</h3>
                  <ul>
                    {narrativeData.interventions.map((intervention, idx) => (
                      <li key={idx}>{intervention}</li>
                    ))}
                  </ul>
                </section>
              )}

              {narrativeData.medications && (
                <section className="narrative-section">
                  <h3>Medications</h3>
                  <ul>
                    {narrativeData.medications.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          ) : (
            <div className="narrative-modal-empty">
              <p>No protocol response yet. Ask the assistant something.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="narrative-modal-footer">
          <button
            className="action-button-secondary"
            onClick={handleClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
