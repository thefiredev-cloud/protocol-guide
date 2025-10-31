'use client';

import { AlertCircle, FileText, Heart, Pill, Search, Zap, Activity, Thermometer } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

interface WelcomeHeroProps {
  onProtocolSelect: (protocol: string) => void;
  onExampleSelect: (example: string) => void;
}

/**
 * WelcomeHero - iPad-optimized welcome screen with landscape support
 * Designed for emergency medical use with immediate action clarity
 * 
 * Hierarchy:
 * 1. HERO (35%): Large search + protocol number grid - MOST PROMINENT
 * 2. SHORTCUTS (30%): Critical protocol cards - MEDIUM
 * 3. EXAMPLES (15%): Quick scenario buttons - SMALL
 * 4. EMERGENCY (20%): Base hospital contact - HIGH VISIBILITY
 * 
 * NEW FEATURES:
 * - Landscape mode detection with two-column layout
 * - Protocol number quick-launch grid (numeric keypad style)
 * - Quick-insert common phrases for faster input
 * - Enhanced iPad touch targets (80-120px minimum)
 */
export function WelcomeHero({ onProtocolSelect, onExampleSelect }: WelcomeHeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);

  // Detect landscape orientation for iPad
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

  // Protocol number quick-access (most common LA County protocols)
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

  // Quick-insert common phrases for faster documentation
  const quickPhrases = [
    { icon: <Activity size={32} />, text: 'Patient unresponsive', label: 'Unresponsive' },
    { icon: <Heart size={32} />, text: 'Chest pain, radiating to left arm', label: 'Chest Pain' },
    { icon: <Thermometer size={32} />, text: 'Difficulty breathing, wheezing', label: 'Resp Distress' },
    { icon: <Zap size={32} />, text: 'Altered mental status', label: 'AMS' },
  ];

  // Critical protocols for immediate access
  const criticalProtocols = [
    { 
      code: '1207', 
      title: 'Cardiac Arrest', 
      urgency: 'critical' as const,
      icon: <Heart size={44} strokeWidth={2.5} />,
      color: '#C41E3A',
    },
    { 
      code: '1231', 
      title: 'Airway Obstruction', 
      urgency: 'critical' as const,
      icon: <AlertCircle size={44} strokeWidth={2.5} />,
      color: '#C41E3A',
    },
    { 
      code: '1211', 
      title: 'Cardiac Chest Pain', 
      urgency: 'high' as const,
      icon: <Heart size={44} strokeWidth={2.5} />,
      color: '#FF9F0A',
    },
    { 
      code: '1233', 
      title: 'Respiratory Distress', 
      urgency: 'high' as const,
      icon: <AlertCircle size={44} strokeWidth={2.5} />,
      color: '#FF9F0A',
    },
  ];

  const exampleScenarios = [
    '68yo male, chest pain radiating to left arm',
    'Pediatric patient, 7yo, wheezing, history of asthma',
    'Trauma - fall from ladder, approximately 12 feet',
    'Unresponsive patient, no pulse, CPR in progress',
  ];

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      onProtocolSelect(searchQuery);
      setSearchQuery('');
    }
  }, [searchQuery, onProtocolSelect]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleQuickProtocol = useCallback((code: string) => {
    onProtocolSelect(`Protocol ${code}`);
  }, [onProtocolSelect]);

  const handleQuickPhrase = useCallback((text: string) => {
    onExampleSelect(text);
  }, [onExampleSelect]);

  return (
    <div className={`welcome-hero ${isLandscape ? 'landscape-mode' : 'portrait-mode'}`}>
      {/* LANDSCAPE: Two-column layout */}
      {isLandscape ? (
        <div className="landscape-container">
          {/* LEFT COLUMN: Search + Protocol Grid */}
          <div className="landscape-left">
            <section className="welcome-hero-main-compact">
              <h1 className="welcome-hero-title-compact">LA County Protocols</h1>
              <p className="welcome-hero-subtitle-compact">Quick access to protocols</p>

              {/* Search Bar */}
              <div className="welcome-search-container-compact">
                <Search size={28} className="welcome-search-icon" strokeWidth={2.5} />
                <input
                  type="search"
                  className="welcome-search-input"
                  placeholder="Protocol number or scenario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="welcome-search-button"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                >
                  Search
                </button>
              </div>
            </section>

            {/* Protocol Number Grid - Numeric Keypad Style */}
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

          {/* RIGHT COLUMN: Quick Phrases + Emergency Contact */}
          <div className="landscape-right">
            <section className="quick-phrases-section">
              <h3 className="quick-phrases-title">Common Scenarios</h3>
              <div className="quick-phrases-grid">
                {quickPhrases.map((phrase, index) => (
                  <button
                    key={index}
                    type="button"
                    className="quick-phrase-button"
                    onClick={() => handleQuickPhrase(phrase.text)}
                  >
                    <div className="quick-phrase-icon">{phrase.icon}</div>
                    <span className="quick-phrase-label">{phrase.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Emergency Contact - Compact for landscape */}
            <div className="welcome-emergency-contact-landscape">
              <a href="tel:(323) 881-2411" className="emergency-contact-button primary">
                <AlertCircle size={32} strokeWidth={2.5} />
                <div className="emergency-contact-text">
                  <strong className="emergency-contact-label-compact">BASE HOSPITAL</strong>
                  <span className="emergency-contact-number-compact">(323) 881-2411</span>
                </div>
              </a>
              <a href="/base-hospitals" className="emergency-contact-button secondary">
                <FileText size={28} strokeWidth={2.5} />
                <span className="directory-link-text-compact">All Hospitals →</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* PORTRAIT: Original single-column layout with enhancements */
        <>
          {/* HERO SECTION - Enhanced with protocol grid */}
          <section className="welcome-hero-main">
            <h1 className="welcome-hero-title">
              LA County Protocols
            </h1>
            <p className="welcome-hero-subtitle">
              Search protocols or describe your patient scenario
            </p>

            {/* Large, prominent search */}
            <div className="welcome-search-container">
              <Search size={36} className="welcome-search-icon" strokeWidth={2.5} />
              <input
                type="search"
                className="welcome-search-input"
                placeholder="Protocol number, chief complaint, or scenario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <button
                type="button"
                className="welcome-search-button"
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                Search
              </button>
            </div>

            {/* Protocol Number Quick-Access Grid */}
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

      {/* CRITICAL PROTOCOLS - Only show in portrait */}
      {!isLandscape && (
        <section className="welcome-protocols-section">
          <h2 className="welcome-section-title">Critical Protocols</h2>
          <div className="welcome-protocol-grid">
            {criticalProtocols.map((protocol) => (
              <button
                key={protocol.code}
                type="button"
                className={`protocol-card-large protocol-${protocol.urgency}`}
                onClick={() => onProtocolSelect(`Protocol ${protocol.code}`)}
                style={{ borderColor: protocol.color }}
              >
                <div className="protocol-card-icon" style={{ color: protocol.color }}>
                  {protocol.icon}
                </div>
                <div className="protocol-card-content">
                  <div className="protocol-card-code" style={{ color: protocol.color }}>
                    {protocol.code}
                  </div>
                  <div className="protocol-card-title">
                    {protocol.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* EXAMPLES - Only show in portrait */}
      {!isLandscape && (
        <section className="welcome-examples-section-expanded">
          <h2 className="welcome-section-subtitle">Example Scenarios</h2>
          <div className="welcome-examples-grid">
            {exampleScenarios.map((scenario, index) => (
              <button
                key={index}
                type="button"
                className="welcome-example-card"
                onClick={() => onExampleSelect(scenario)}
              >
                <Pill size={36} className="example-icon" strokeWidth={2.5} />
                <span className="example-text">{scenario}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Emergency Contact - Only show in portrait (landscape has compact version) */}
      {!isLandscape && (
        <div className="welcome-emergency-contact">
          <a href="tel:(323) 881-2411" className="emergency-contact-button primary">
            <AlertCircle size={40} strokeWidth={2.5} />
            <div className="emergency-contact-text">
              <strong className="emergency-contact-label">Base Hospital (LAC+USC)</strong>
              <span className="emergency-contact-number">(323) 881-2411</span>
            </div>
          </a>
          <a href="/base-hospitals" className="emergency-contact-button secondary">
            <FileText size={36} strokeWidth={2.5} />
            <span className="directory-link-text">View All Base Hospitals →</span>
          </a>
        </div>
      )}
    </div>
  );
}

