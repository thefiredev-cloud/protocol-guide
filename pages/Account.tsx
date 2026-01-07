import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_EMAILS } from '../components/AdminRoute';

const Account: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial theme state from DOM or storage
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="pt-16 pb-28 px-5 max-w-3xl mx-auto relative">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
        </button>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700 mb-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-600 shadow-sm overflow-hidden">
              <img 
                alt="Profile Avatar" 
                className="w-full h-full object-cover" 
                src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg" 
              />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">check</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Unknown User'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user?.department || 'Unknown Dept.'}</p>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Active Duty
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Employee ID</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.employeeId || 'N/A'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Station</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.station || 'N/A'}</p>
          </div>
        </div>
        <div className="mt-4 text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Email</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-all">{user?.email || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ml-1">Workplace</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
          <div className="w-full text-left p-4 flex items-center gap-4 opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-slate-900 dark:text-white">Chat History</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Coming soon</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">lock</span>
          </div>
          <div className="w-full text-left p-4 flex items-center gap-4 opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined">folder_shared</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-slate-900 dark:text-white">ImageTrend Elite</p>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full">COMING SOON</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Integration not available</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">lock</span>
          </div>
          <div className="w-full text-left p-4 flex items-center gap-4 opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-full bg-[#9B1B30]/20 dark:bg-[#9B1B30]/30 flex items-center justify-center text-[#9B1B30] dark:text-[#C9344F]">
              <span className="material-symbols-outlined">bookmark</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-slate-900 dark:text-white">Saved Protocols</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Coming soon</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">lock</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ml-1">Preferences</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
          <div className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
              </div>
              <span className="text-base font-medium text-slate-900 dark:text-white">Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isDark} onChange={toggleTheme} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="w-full text-left p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </div>
              <span className="text-base font-medium text-slate-900 dark:text-white">Notifications</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">lock</span>
          </div>
          <div className="w-full text-left p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-[20px]">help</span>
              </div>
              <span className="text-base font-medium text-slate-900 dark:text-white">Support & Feedback</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">lock</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {ADMIN_EMAILS.includes(user?.email || '') && (
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center justify-center gap-2 font-semibold text-sm py-3 px-6 rounded-xl transition-colors w-full bg-primary text-white hover:bg-[#7A1628] shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            Admin Dashboard
          </button>
        )}
        <button
          onClick={handleLogout}
          className="text-[#9B1B30] dark:text-[#C9344F] font-semibold text-sm py-3 px-6 rounded-xl hover:bg-[#9B1B30]/10 dark:hover:bg-[#9B1B30]/20 transition-colors w-full bg-white dark:bg-slate-800 border border-[#9B1B30]/20 dark:border-[#9B1B30]/30 shadow-sm"
        >
          Log Out
        </button>
        <p className="mt-6 text-[11px] text-slate-400 text-center leading-relaxed">
          ProtocolGuide for iOS v2.4.1 (Build 89)<br />
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Account;