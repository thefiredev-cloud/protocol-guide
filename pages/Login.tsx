import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Check if component is still mounted
    if (!isMounted.current) return;

    try {
      const success = await login(email, password);
      if (!isMounted.current) return;

      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('Invalid email or password');
        setIsSubmitting(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Login failed. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col items-center justify-center px-6">
      {/* Logo/Branding */}
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="Protocol Guide" className="w-24 h-24 mx-auto mb-4 bg-white rounded-2xl p-3 shadow-lg" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ProtocolGuide</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">LA County EMS Reference</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                maxLength={100}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-transparent dark:border-slate-600 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                maxLength={100}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-transparent dark:border-slate-600 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl">
              <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-[#7A1628] text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#9B1B30]/20"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI-Powered</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Authorized Personnel Only<br />
          ProtocolGuide v2.5.0
        </p>
      </div>
    </div>
  );
};

export default Login;
