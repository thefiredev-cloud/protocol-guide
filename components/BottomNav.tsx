
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconChat, IconBook, IconUser, IconMic, IconHospital } from './Icons';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/' && (currentPath === '/' || currentPath.startsWith('/protocol'))) return true;
    if (path === '/chat' && currentPath === '/chat') return true;
    if (path === '/account' && currentPath === '/account') return true;
    if (path === '/hospitals' && currentPath === '/hospitals') return true;
    return false;
  };

  const getButtonClass = (path: string) => {
    const active = isActive(path);
    // EMS touch targets: minimum 76dp, full height for gloved hands
    return `flex flex-col items-center justify-center flex-1 h-full min-w-[76px] gap-1.5 transition-all active:scale-95 ${
      active
        ? 'text-primary dark:text-[#C9344F]'
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 active:text-slate-700'
    }`;
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 pb-safe pt-3 px-2 z-50 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
      {/* EMS: 80px nav height for gloved finger touch targets */}
      <div className="flex justify-between items-center max-w-3xl mx-auto h-[80px]">
        <button
          onClick={() => navigate('/chat')}
          className={getButtonClass('/chat')}
        >
          <IconChat className="w-8 h-8" strokeWidth={isActive('/chat') ? 2.5 : 1.8} />
          <span className="text-xs font-bold">Assistant</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className={getButtonClass('/')}
        >
          <IconBook className="w-8 h-8" strokeWidth={isActive('/') ? 2.5 : 1.8} />
          <span className="text-xs font-bold">Protocols</span>
        </button>

        {/* Center mic button - EMS: 76px minimum touch target */}
        <div className="relative flex-1 flex justify-center -mt-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] bg-slate-200 dark:bg-slate-700 rounded-full blur-xl opacity-30"></div>
          <button
            disabled
            title="Voice input coming soon"
            className="relative w-[76px] h-[76px] bg-slate-400 dark:bg-slate-600 rounded-full flex items-center justify-center text-white/70 shadow-lg z-10 border-4 border-white dark:border-slate-900 cursor-not-allowed opacity-60"
          >
            <IconMic className="w-9 h-9" strokeWidth={2.2} />
          </button>
        </div>

        <button
          onClick={() => navigate('/hospitals')}
          className={getButtonClass('/hospitals')}
        >
          <IconHospital className="w-8 h-8" strokeWidth={isActive('/hospitals') ? 2.5 : 1.8} />
          <span className="text-xs font-bold">Hospitals</span>
        </button>

        <button
          onClick={() => navigate('/account')}
          className={getButtonClass('/account')}
        >
          <IconUser className="w-8 h-8" strokeWidth={isActive('/account') ? 2.5 : 1.8} />
          <span className="text-xs font-bold">Account</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;