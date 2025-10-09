'use client';

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

  return (
    <div className="container">
      <h1>Scene Dashboard</h1>

      <div className="scene-timer">
        <div className="timer-display">{formatTime(seconds)}</div>
        <div className="timer-controls">
          <button onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={() => { setSeconds(0); setIsRunning(false); }}>
            Reset
          </button>
        </div>
      </div>

      <div className="scene-grid">
        <a href="/" className="scene-card">
          <span className="scene-card-icon">💬</span>
          <span className="scene-card-label">Chat</span>
        </a>
        <a href="/dosing" className="scene-card">
          <span className="scene-card-icon">💊</span>
          <span className="scene-card-label">Dosing</span>
        </a>
        <a href="/protocols" className="scene-card">
          <span className="scene-card-icon">📋</span>
          <span className="scene-card-label">Protocols</span>
        </a>
      </div>
    </div>
  );
}
