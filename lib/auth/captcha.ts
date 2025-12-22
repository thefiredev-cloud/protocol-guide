/**
 * hCaptcha Verification
 * Server-side token validation for bot protection
 * Note: Supabase Auth handles this built-in, but this utility is kept for other uses.
 */

const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY;
const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

/**
 * hCaptcha verification response
 */
interface HCaptchaResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify an hCaptcha token
 * @param token - The token from the frontend widget
 * @param ip - Optional client IP for additional validation
 * @returns true if valid, false otherwise
 */
export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  // Skip verification in development if no secret configured
  if (!HCAPTCHA_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CAPTCHA] No HCAPTCHA_SECRET_KEY configured, skipping verification in development');
      return true;
    }
    console.error('[CAPTCHA] HCAPTCHA_SECRET_KEY is required in production');
    return false;
  }

  try {
    const body = new URLSearchParams({
      secret: HCAPTCHA_SECRET,
      response: token,
    });

    if (ip) {
      body.append('remoteip', ip);
    }

    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data: HCaptchaResponse = await response.json();

    if (!data.success && data['error-codes']) {
      console.error('[CAPTCHA] Verification failed:', data['error-codes'].join(', '));
    }

    return data.success === true;
  } catch (error) {
    console.error('[CAPTCHA] Verification error:', error);
    return false;
  }
}
