'use client';

import { Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useAuth } from '../contexts/authentication-context';
import Aurora from '../components/ui/aurora-effect';

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '10000000-ffff-ffff-ffff-000000000001';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error } = useAuth();
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const redirect = searchParams.get('redirect') ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!captchaToken) {
      setLocalError('Please complete the hCaptcha verification');
      return;
    }

    try {
      await login(email, password, captchaToken);
      router.push(redirect);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
      // Reset hCaptcha on failure
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
  }

  const displayError = localError ?? error;

  return (
    <div className="login-container">
      <div className="login-background">
        <Aurora 
          colorStops={['#04111f', '#0a1929', '#132f4c']}
          amplitude={1.2}
          speed={0.5}
        />
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1>County Medic</h1>
          <h2>LA County Protocol Assistant</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {displayError && (
            <div className="login-error" role="alert">
              {displayError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="captcha-container">
            <HCaptcha
              sitekey={HCAPTCHA_SITE_KEY}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              ref={captchaRef}
              theme="light"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading || !captchaToken}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-help">Contact IT support if you need access</p>
      </div>

      <style jsx>{`
        .login-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: #04111f;
          overflow: hidden;
        }

        .login-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .login-card {
          position: relative;
          z-index: 10;
          background: #ffffff;
          border-radius: 12px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          color: #c41e3a;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-header h2 {
          color: #1a1a2e;
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .form-group input {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #c41e3a;
          box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
        }

        .form-group input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .login-button {
          background: #c41e3a;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 0.5rem;
        }

        .login-button:hover:not(:disabled) {
          background: #a31830;
        }

        .login-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .captcha-container {
          display: flex;
          justify-content: center;
          margin: 0.5rem 0;
        }

        .login-help {
          text-align: center;
          color: #6b7280;
          font-size: 0.75rem;
          margin: 1.5rem 0 0;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#04111f] text-white">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
