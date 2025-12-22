/**
 * Cloudflare Turnstile CAPTCHA Verification
 * Server-side token validation for bot protection
 */

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Turnstile verification response
 */
interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile CAPTCHA token
 * @param token - The token from the frontend widget
 * @param ip - Optional client IP for additional validation
 * @returns true if valid, false otherwise
 */
export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  // Skip verification in development if no secret configured
  if (!TURNSTILE_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CAPTCHA] No TURNSTILE_SECRET_KEY configured, skipping verification in development');
      return true;
    }
    console.error('[CAPTCHA] TURNSTILE_SECRET_KEY is required in production');
    return false;
  }

  try {
    const body = new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: token,
    });

    if (ip) {
      body.append('remoteip', ip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data: TurnstileResponse = await response.json();

    if (!data.success && data['error-codes']) {
      console.error('[CAPTCHA] Verification failed:', data['error-codes'].join(', '));
    }

    return data.success === true;
  } catch (error) {
    console.error('[CAPTCHA] Verification error:', error);
    return false;
  }
}
