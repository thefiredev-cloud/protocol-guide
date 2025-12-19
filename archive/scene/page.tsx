'use client';

import { ClipboardList, FileText, MessageCircle, Phone, Pill } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ScenePage() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const baseHospitalNumber = '(323) 881-2411';

  return (
    <div className="scene-container">
      <div className="scene-header">
        <h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>Scene Dashboard</h1>
        <div className="scene-timer-compact">
          <div className="timer-display-large">{formatTime(seconds)}</div>
          <div className="timer-controls-inline">
            <button onClick={() => setIsRunning(!isRunning)} style={{ minHeight: '56px', fontSize: '18px', fontWeight: 700, padding: '0 28px', borderRadius: '12px' }}>
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => { setSeconds(0); setIsRunning(false); }} style={{ minHeight: '56px', fontSize: '18px', fontWeight: 700, padding: '0 28px', borderRadius: '12px' }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="scene-action-grid">
        <a href="/" className="scene-action-card">
          <MessageCircle size={56} strokeWidth={2.5} className="scene-action-icon" />
          <span className="scene-action-label">Chat</span>
          <span className="scene-action-description">Protocol guidance</span>
        </a>
        <a href="/dosing" className="scene-action-card">
          <Pill size={56} strokeWidth={2.5} className="scene-action-icon" />
          <span className="scene-action-label">Dosing</span>
          <span className="scene-action-description">Medication calculator</span>
        </a>
        <a href="/protocols" className="scene-action-card">
          <ClipboardList size={56} strokeWidth={2.5} className="scene-action-icon" />
          <span className="scene-action-label">Protocols</span>
          <span className="scene-action-description">Decision trees</span>
        </a>
        <a href="#narrative" className="scene-action-card">
          <FileText size={56} strokeWidth={2.5} className="scene-action-icon" />
          <span className="scene-action-label">Narrative</span>
          <span className="scene-action-description">Build report</span>
        </a>
      </div>

      <a href={`tel:${baseHospitalNumber}`} className="base-hospital-button">
        <Phone size={32} strokeWidth={2.5} />
        <div className="base-hospital-text">
          <span className="base-hospital-label">Base Hospital</span>
          <span className="base-hospital-number">{baseHospitalNumber}</span>
        </div>
      </a>
    </div>
  );
}
