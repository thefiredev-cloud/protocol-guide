/**
 * ImageTrend OAuth Callback Endpoint
 * GET /api/integrations/imagetrend/oauth/callback
 *
 * Handles OAuth 2.0 callback from ImageTrend
 * Exchanges authorization code for access tokens using PKCE
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../../../lib/api/handler';
import { authService } from '../../../../../../lib/auth/auth-service';
import type { AuthUser } from '../../../../../../lib/auth/types';
import { getSupabaseAdminClient } from '../../../../../../lib/db/client';
import { createLogger } from '../../../../../../lib/log';
import { encrypt } from '../../../../../../lib/utils/encryption';

const logger = createLogger('api.integrations.imagetrend.oauth.callback');

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  agency_id?: string;
}

function redirectWithError(origin: string, error: string, message?: string): NextResponse {
  const url = new URL('/settings/integrations', origin);
  url.searchParams.set('error', error);
  if (message) url.searchParams.set('message', message);
  return NextResponse.redirect(url.toString());
}

async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<TokenResponse> {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Token exchange failed', { status: response.status, error: errorText });
    throw new Error('Token exchange failed');
  }

  return response.json();
}

async function storeTokens(userId: string, tokens: TokenResponse): Promise<void> {
  const encryptedAccessToken = encrypt(tokens.access_token);
  const encryptedRefreshToken = encrypt(tokens.refresh_token);
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('imagetrend_integrations').upsert({
    user_id: userId,
    agency_id: tokens.agency_id,
    access_token: encryptedAccessToken,
    refresh_token: encryptedRefreshToken,
    expires_at: expiresAt.toISOString(),
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

/**
 * GET /api/integrations/imagetrend/oauth/callback
 * Handle OAuth callback and exchange code for tokens
 */
export const GET = withApiHandler(
  // eslint-disable-next-line @typescript-eslint/naming-convention, max-lines-per-function
  async (_input: unknown, req: NextRequest) => {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      logger.error('OAuth authorization failed', { error, errorDescription });
      return redirectWithError(url.origin, 'oauth_failed', errorDescription || error);
    }

    if (!code || !state) {
      logger.error('Missing OAuth parameters', { hasCode: !!code, hasState: !!state });
      return redirectWithError(url.origin, 'invalid_callback');
    }

    const token = req.cookies.get('sb-access-token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', url.origin);
      loginUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(loginUrl.toString());
    }

    const user: AuthUser | null = await authService.validateToken(token);
    if (!user) {
      const loginUrl = new URL('/login', url.origin);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl.toString());
    }

    const storedState = req.cookies.get('imagetrend_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      logger.error('State mismatch', { hasStored: !!storedState, match: storedState === state });
      return redirectWithError(url.origin, 'state_mismatch');
    }

    const codeVerifier = req.cookies.get('imagetrend_oauth_verifier')?.value;
    if (!codeVerifier) {
      logger.error('Missing code_verifier');
      return redirectWithError(url.origin, 'missing_verifier');
    }

    const clientId = process.env.IMAGETREND_CLIENT_ID;
    const clientSecret = process.env.IMAGETREND_CLIENT_SECRET;
    const tokenUrl = process.env.IMAGETREND_TOKEN_URL;
    const redirectUri = process.env.IMAGETREND_REDIRECT_URI;

    if (!clientId || !clientSecret || !tokenUrl || !redirectUri) {
      logger.error('ImageTrend OAuth not configured');
      return redirectWithError(url.origin, 'config_error');
    }

    try {
      const tokens = await exchangeCodeForTokens(code, codeVerifier, tokenUrl, clientId, clientSecret, redirectUri);
      await storeTokens(user.id, tokens);

      logger.info('OAuth connection successful', { userId: user.id, agencyId: tokens.agency_id });

      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('success', 'imagetrend_connected');
      const response = NextResponse.redirect(settingsUrl.toString());
      response.cookies.delete('imagetrend_oauth_state');
      response.cookies.delete('imagetrend_oauth_verifier');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('OAuth callback error', { error: errorMessage });
      return redirectWithError(url.origin, 'unexpected_error');
    }
  },
  {
    loggerName: 'api.integrations.imagetrend.oauth.callback',
    rateLimit: 'DEFAULT',
  }
);
