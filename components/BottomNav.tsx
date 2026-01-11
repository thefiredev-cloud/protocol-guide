/**
 * BottomNav - Main navigation bar
 *
 * Design matches screenshot:
 * - Red filled Assistant icon
 * - Gray stroke icons for Protocols, Hospitals, Account
 * - Gradient mic button with voice input
 * - Subtle underline active indicator
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconAssistant, IconProtocols, IconHospitals, IconUser, IconMic } from './Icons';
import { useVoiceInput } from '../contexts/VoiceInputContext';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { isListening, isSupported, startListening, stopListening, error } = useVoiceInput();

  const isActive = (path: string) => {
    if (path === '/' && (currentPath === '/' || currentPath.startsWith('/protocol'))) return true;
    if (path === '/chat' && currentPath === '/chat') return true;
    if (path === '/account' && currentPath === '/account') return true;
    if (path === '/hospitals' && currentPath === '/hospitals') return true;
    return false;
  };

  const handleMicClick = () => {
    if (!isSupported) {
      alert('Voice input is not supported in your browser. Try Chrome or Safari.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-50 dark:bg-slate-900 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 pb-safe pt-3 px-2 z-50 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
      {/* EMS: 80px nav height for gloved finger touch targets */}
      <div className="flex justify-between items-center max-w-3xl mx-auto h-[80px]">

        {/* Assistant - Red filled icon */}
        <button
          onClick={() => navigate('/chat')}
          className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[76px] gap-1.5 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        >
          <IconAssistant className="w-8 h-8" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Assistant</span>
          {isActive('/chat') && (
            <span className="absolute bottom-2 w-6 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        {/* Protocols - Gray stroke icon */}
        <button
          onClick={() => navigate('/')}
          className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[76px] gap-1.5 transition-all active:scale-95 text-slate-500 dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        >
          <IconProtocols className="w-8 h-8" strokeWidth={1.8} />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Protocols</span>
          {isActive('/') && (
            <span className="absolute bottom-2 w-6 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        {/* Center mic button - Voice input enabled */}
        <div className="relative flex-1 flex justify-center -mt-10">
          {/* Soft glow behind button */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full blur-xl opacity-30 transition-colors ${
            isListening ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
          }`} />

          <button
            onClick={handleMicClick}
            title={isListening ? 'Stop listening' : (isSupported ? 'Start voice input' : 'Voice input not supported')}
            className={`relative w-[76px] h-[76px] rounded-full flex items-center justify-center shadow-lg z-10 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${
              isListening
                ? 'bg-primary animate-pulse ring-4 ring-primary/30'
                : 'bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 ring-4 ring-white dark:ring-slate-800'
            } ${!isSupported ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <IconMic
              className={`w-9 h-9 transition-colors ${
                isListening ? 'text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
              strokeWidth={2.2}
            />
          </button>

          {/* Error indicator */}
          {error && (
            <span className="absolute -bottom-6 text-xs text-red-500 whitespace-nowrap">
              {error === 'not-allowed' ? 'Mic access denied' : 'Voice error'}
            </span>
          )}
        </div>

        {/* Hospitals - Gray stroke icon */}
        <button
          onClick={() => navigate('/hospitals')}
          className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[76px] gap-1.5 transition-all active:scale-95 text-slate-500 dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        >
          <IconHospitals className="w-8 h-8" strokeWidth={1.8} />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Hospitals</span>
          {isActive('/hospitals') && (
            <span className="absolute bottom-2 w-6 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        {/* Account - Gray stroke icon */}
        <button
          onClick={() => navigate('/account')}
          className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[76px] gap-1.5 transition-all active:scale-95 text-slate-500 dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        >
          <IconUser className="w-8 h-8" strokeWidth={1.8} />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Account</span>
          {isActive('/account') && (
            <span className="absolute bottom-2 w-6 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
