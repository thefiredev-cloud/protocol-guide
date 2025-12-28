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

/**
 * GET /api/integrations/imagetrend/oauth/callback
 * Handle OAuth callback and exchange code for tokens
 */
export const GET = withApiHandler(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  async (_input: unknown, req: NextRequest) => {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Handle OAuth errors from ImageTrend
    if (error) {
      logger.error('OAuth authorization failed', {
        error,
        errorDescription,
      });

      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('error', 'oauth_failed');
      settingsUrl.searchParams.set('message', errorDescription || error);

      return NextResponse.redirect(settingsUrl.toString());
    }

    // Validate required parameters
    if (!code || !state) {
      logger.error('Missing required OAuth parameters', { hasCode: !!code, hasState: !!state });

      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('error', 'invalid_callback');
      return NextResponse.redirect(settingsUrl.toString());
    }

    // Verify user is authenticated
    const token = req.cookies.get('sb-access-token')?.value;
    if (!token) {
      logger.error('User not authenticated during OAuth callback');

      const loginUrl = new URL('/login', url.origin);
      loginUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(loginUrl.toString());
    }

    // Validate user session and get user ID
    const user = await authService.validateToken(token);
    if (!user) {
      logger.error('Invalid user token during OAuth callback');

      const loginUrl = new URL('/login', url.origin);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl.toString());
    }

    // Validate state parameter (CSRF protection)
    const storedState = req.cookies.get('imagetrend_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      logger.error('State mismatch - possible CSRF attack', {
        hasStoredState: !!storedState,
        statesMatch: storedState === state,
      });

      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('error', 'state_mismatch');
      return NextResponse.redirect(settingsUrl.toString());
    }

    // Get PKCE code_verifier
    const codeVerifier = req.cookies.get('imagetrend_oauth_verifier')?.value;
    if (!codeVerifier) {
      logger.error('Missing code_verifier');

      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('error', 'missing_verifier');
      return NextResponse.redirect(settingsUrl.toString());
    }

    // Validate environment configuration
    const clientId = process.env.IMAGETREND_CLIENT_ID;
    const clientSecret = process.env.IMAGETREND_CLIENT_SECRET;
    const tokenUrl = process.env.IMAGETREND_TOKEN_URL;
    const redirectUri = process.env.IMAGETREND_REDIRECT_URI;

    if (!clientId || !clientSecret || !tokenUrl || !redirectUri) {
      logger.error('ImageTrend OAuth not configured');

      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('error', 'config_error');
      return NextResponse.redirect(settingsUrl.toString());
    }

    try {
      // Exchange authorization code for tokens
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        logger.error('Token exchange failed', {
          status: tokenResponse.status,
          error: errorText,
        });

        const settingsUrl = new URL('/settings/integrations', url.origin);
        settingsUrl.searchParams.set('error', 'token_exchange_failed');
        return NextResponse.redirect(settingsUrl.toString());
      }

      const tokens: TokenResponse = await tokenResponse.json();

      // Encrypt tokens before storing
      const encryptedAccessToken = encrypt(tokens.access_token);
      const encryptedRefreshToken = encrypt(tokens.refresh_token);

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Store tokens in database
      const supabase = getSupabaseAdminClient();
      const { error: dbError } = await supabase
        .from('imagetrend_integrations')
        .upsert({
          user_id: user.id,
          agency_id: tokens.agency_id,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_at: expiresAt.toISOString(),
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (dbError) {
        logger.error('Failed to store tokens', {
          error: dbError.message,
          userId: user.id,
        });

        const settingsUrl = new URL('/settings/integrations', url.origin);
        settingsUrl.searchParams.set('error', 'storage_failed');
        return NextResponse.redirect(settingsUrl.toString());
      }

      logger.info('OAuth connection successful', {
        userId: user.id,
        agencyId: tokens.agency_id,
      });

      // Redirect to settings with success message
      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('success', 'imagetrend_connected');

      const response = NextResponse.redirect(settingsUrl.toString());

      // Clear OAuth cookies
      response.cookies.delete('imagetrend_oauth_state');
      response.cookies.delete('imagetrend_oauth_verifier');

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('OAuth callback error', { error: errorMessage });

      const settingsUrl = new URL('/settings/integrations', url.origin);
      settingsUrl.searchParams.set('error', 'unexpected_error');
      return NextResponse.redirect(settingsUrl.toString());
    }
  },
  {
    loggerName: 'api.integrations.imagetrend.oauth.callback',
    rateLimit: 'DEFAULT',
  }
);
