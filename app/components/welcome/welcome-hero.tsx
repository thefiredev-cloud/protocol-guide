'use client';

import { useCallback, useEffect, useState } from 'react';

interface WelcomeHeroProps {
  onProtocolSelect: (protocol: string) => void;
  onExampleSelect: (example: string) => void;
  onSearch: (query: string) => void;
}

export function WelcomeHero({ onProtocolSelect }: WelcomeHeroProps) {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth >= 1024);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const quickProtocols = [
    { code: '1207', label: 'Cardiac Arrest', color: '#C41E3A' },
    { code: '1211', label: 'Chest Pain', color: '#FF9F0A' },
    { code: '1231', label: 'Airway', color: '#C41E3A' },
    { code: '1233', label: 'Respiratory', color: '#FF9F0A' },
    { code: '1234', label: 'AMS', color: '#FF9F0A' },
    { code: '1235', label: 'Stroke', color: '#C41E3A' },
    { code: '1215', label: 'Anaphylaxis', color: '#FF9F0A' },
    { code: '1223', label: 'Diabetic', color: '#FF9F0A' },
    { code: '506', label: 'Trauma', color: '#FF9F0A' },
    { code: '1232', label: 'Seizure', color: '#FF9F0A' },
  ];

  const handleQuickProtocol = useCallback((code: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onProtocolSelect(`Protocol ${code}`);
  }, [onProtocolSelect]);

  return (
    <div className={`welcome-hero ${isLandscape ? 'landscape-mode' : 'portrait-mode'}`}>
      {isLandscape ? (
        <div className="landscape-container">
          <div className="landscape-left">
            <section className="welcome-hero-main-compact">
              <h1 className="welcome-hero-title-compact">LA County Protocols</h1>
              <p className="welcome-hero-subtitle-compact">Quick access to protocols</p>
            </section>

            <section className="protocol-quick-grid">
              <h3 className="quick-grid-title">Quick Access</h3>
              <div className="protocol-grid-buttons">
                {quickProtocols.map((protocol) => (
                  <button
                    key={protocol.code}
                    type="button"
                    className="protocol-number-button"
                    onClick={() => handleQuickProtocol(protocol.code)}
                    style={{ borderColor: protocol.color }}
                  >
                    <span className="protocol-number" style={{ color: protocol.color }}>
                      {protocol.code}
                    </span>
                    <span className="protocol-label">{protocol.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

        </div>
      ) : (
        <>
          <section className="welcome-hero-main">
            <h1 className="welcome-hero-title">
              LA County Protocols
            </h1>
            <p className="welcome-hero-subtitle">
              Search protocols or describe your patient scenario
            </p>

            <div className="protocol-quick-access-section">
              <h3 className="quick-access-title">Quick Protocol Access</h3>
              <div className="protocol-quick-buttons">
                {quickProtocols.slice(0, 6).map((protocol) => (
                  <button
                    key={protocol.code}
                    type="button"
                    className="protocol-quick-button"
                    onClick={() => handleQuickProtocol(protocol.code)}
                    style={{ borderColor: protocol.color, color: protocol.color }}
                  >
                    <span className="quick-button-code">{protocol.code}</span>
                    <span className="quick-button-label">{protocol.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}
