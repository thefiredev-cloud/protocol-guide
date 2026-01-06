import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WidgetModeContextType {
  isWidgetMode: boolean;
  isExpanded: boolean;
  toggleExpanded: () => void;
  expand: () => void;
  collapse: () => void;
  patientContext: PatientContext | null;
  setPatientContext: (context: PatientContext | null) => void;
}

export interface PatientContext {
  age?: number;
  ageUnit?: 'years' | 'months' | 'days';
  weight?: number; // kg
  sex?: 'male' | 'female' | 'unknown';
  chiefComplaint?: string;
  incidentType?: string;
}

const WidgetModeContext = createContext<WidgetModeContextType | undefined>(undefined);

// Detect if we're running inside an iframe
const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    // If we can't access window.top due to cross-origin, we're in an iframe
    return true;
  }
};

// Check URL for widget mode param
const hasWidgetModeParam = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'widget';
};

export const WidgetModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);

  // Detect widget mode on mount
  useEffect(() => {
    const widgetMode = isInIframe() || hasWidgetModeParam();
    setIsWidgetMode(widgetMode);

    // Start collapsed in widget mode
    if (widgetMode) {
      setIsExpanded(false);
    }
  }, []);

  // Listen for postMessage from ImageTrend parent
  useEffect(() => {
    if (!isWidgetMode) return;

    const handleMessage = (event: MessageEvent) => {
      // Validate origin in production - whitelist allowed embedding domains
      const allowedOrigins = [
        'https://imagetrend.com',
        'https://*.imagetrend.com',
        'https://protocol-guide.com',
        'https://protocol-guide.netlify.app',
      ];

      const isAllowedOrigin = allowedOrigins.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace('*.', '([a-z0-9-]+\\.)?').replace(/\./g, '\\.') + '$');
          return regex.test(event.origin);
        }
        return event.origin === pattern;
      });

      // Allow localhost in development
      const isDev = event.origin.startsWith('http://localhost') || event.origin.startsWith('http://127.0.0.1');

      if (!isAllowedOrigin && !isDev) {
        console.warn('WidgetMode: Rejected message from unauthorized origin:', event.origin);
        return;
      }

      const { type, payload } = event.data || {};

      switch (type) {
        case 'IMAGETREND_HANDSHAKE':
          // Respond to confirm widget is ready
          window.parent?.postMessage({ type: 'PROTOCOL_GUIDE_READY' }, '*');
          break;

        case 'PATIENT_CONTEXT_UPDATE':
          if (payload) {
            setPatientContext(payload);
          }
          break;

        case 'EXPAND_WIDGET':
          setIsExpanded(true);
          break;

        case 'COLLAPSE_WIDGET':
          setIsExpanded(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isWidgetMode]);

  // Notify parent of protocol selection
  const notifyProtocolSelected = useCallback((protocolId: string, protocolTitle: string) => {
    if (isWidgetMode) {
      window.parent?.postMessage({
        type: 'PROTOCOL_SELECTED',
        payload: { protocolId, protocolTitle }
      }, '*');
    }
  }, [isWidgetMode]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);

  return (
    <WidgetModeContext.Provider
      value={{
        isWidgetMode,
        isExpanded,
        toggleExpanded,
        expand,
        collapse,
        patientContext,
        setPatientContext
      }}
    >
      {children}
    </WidgetModeContext.Provider>
  );
};

export const useWidgetMode = (): WidgetModeContextType => {
  const context = useContext(WidgetModeContext);
  if (!context) {
    throw new Error('useWidgetMode must be used within a WidgetModeProvider');
  }
  return context;
};

// Hook to send narrative export to ImageTrend
export const useNarrativeExport = () => {
  const { isWidgetMode } = useWidgetMode();

  const exportNarrative = useCallback((narrative: string) => {
    if (isWidgetMode) {
      window.parent?.postMessage({
        type: 'NARRATIVE_EXPORT',
        payload: { narrative, timestamp: new Date().toISOString() }
      }, '*');
    }
  }, [isWidgetMode]);

  return { exportNarrative };
};
