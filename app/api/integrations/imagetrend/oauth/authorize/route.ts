/**
 * ImageTrend OAuth Authorization Endpoint
 * GET /api/integrations/imagetrend/oauth/authorize
 *
 * Initiates OAuth 2.0 Authorization Code flow with PKCE
 * Redirects user to ImageTrend authorization page
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../../../lib/api/handler';
import { createLogger } from '../../../../../../lib/log';
import { generateSecureRandom, sha256 } from '../../../../../../lib/utils/encryption';

const logger = createLogger('api.integrations.imagetrend.oauth.authorize');

/**
 * GET /api/integrations/imagetrend/oauth/authorize
 * Redirect to ImageTrend authorization URL with PKCE
 */
export const GET = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    // Validate environment configuration
    const clientId = process.env.IMAGETREND_CLIENT_ID;
    const authUrl = process.env.IMAGETREND_AUTH_URL;
    const redirectUri = process.env.IMAGETREND_REDIRECT_URI;

    if (!clientId || !authUrl || !redirectUri) {
      logger.error('ImageTrend OAuth not configured', {
        hasClientId: !!clientId,
        hasAuthUrl: !!authUrl,
        hasRedirectUri: !!redirectUri,
      });

      return NextResponse.json(
        {
          error: {
            code: 'CONFIG_ERROR',
            message: 'ImageTrend integration is not configured',
          },
        },
        { status: 500 }
      );
    }

    // Verify user is authenticated
    const token = req.cookies.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Generate CSRF state token
    const state = generateSecureRandom(32);

    // Generate PKCE code_verifier and code_challenge
    const codeVerifier = generateSecureRandom(64);
    const codeChallenge = await sha256(codeVerifier);

    // Build authorization URL
    const authorizationUrl = new URL(authUrl);
    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', redirectUri);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('code_challenge', codeChallenge);
    authorizationUrl.searchParams.set('code_challenge_method', 'S256');

    // Optional: Add scope if required by ImageTrend
    // authorizationUrl.searchParams.set('scope', 'read write');

    logger.info('Initiating OAuth authorization', {
      redirectUri,
      state: state.substring(0, 8) + '...',
    });

    // Create response with redirect
    const response = NextResponse.redirect(authorizationUrl.toString());

    // Store state and code_verifier in secure HTTP-only cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const, // Lax for OAuth redirect flow
      maxAge: 600, // 10 minutes - short-lived for security
      path: '/api/integrations/imagetrend/oauth',
    };

    response.cookies.set('imagetrend_oauth_state', state, cookieOptions);
    response.cookies.set('imagetrend_oauth_verifier', codeVerifier, cookieOptions);

    return response;
  },
  {
    loggerName: 'api.integrations.imagetrend.oauth.authorize',
    rateLimit: 'DEFAULT',
  }
);
