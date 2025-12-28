/**
 * ImageTrend OAuth Token Refresh Endpoint
 * POST /api/integrations/imagetrend/oauth/refresh
 *
 * Refreshes ImageTrend access token using stored refresh token
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../../../lib/api/handler';
import { authService } from '../../../../../../lib/auth/auth-service';
import { getSupabaseAdminClient } from '../../../../../../lib/db/client';
import { createLogger } from '../../../../../../lib/log';
import { decrypt, encrypt } from '../../../../../../lib/utils/encryption';

const logger = createLogger('api.integrations.imagetrend.oauth.refresh');

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * POST /api/integrations/imagetrend/oauth/refresh
 * Refresh access token
 */
export const POST = withApiHandler(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  async (_input: unknown, req: NextRequest) => {
    // Verify user is authenticated
    const token = req.cookies.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid session' } },
        { status: 401 }
      );
    }

    // Validate environment configuration
    const clientId = process.env.IMAGETREND_CLIENT_ID;
    const clientSecret = process.env.IMAGETREND_CLIENT_SECRET;
    const tokenUrl = process.env.IMAGETREND_TOKEN_URL;

    if (!clientId || !clientSecret || !tokenUrl) {
      logger.error('ImageTrend OAuth not configured');
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'ImageTrend integration not configured' } },
        { status: 500 }
      );
    }

    // Get stored refresh token from database
    const supabase = getSupabaseAdminClient();
    const { data: integration, error: fetchError } = await supabase
      .from('imagetrend_integrations')
      .select('refresh_token, agency_id')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !integration) {
      logger.error('No integration found', { userId: user.id, error: fetchError?.message });
      return NextResponse.json(
        { error: { code: 'NOT_CONNECTED', message: 'ImageTrend not connected' } },
        { status: 404 }
      );
    }

    try {
      // Decrypt stored refresh token
      const refreshToken = decrypt(integration.refresh_token);

      // Exchange refresh token for new access token
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Token refresh failed', {
          status: response.status,
          error: errorText,
          userId: user.id,
        });

        return NextResponse.json(
          { error: { code: 'REFRESH_FAILED', message: 'Failed to refresh token' } },
          { status: 401 }
        );
      }

      const tokens: TokenResponse = await response.json();

      // Encrypt new tokens
      const encryptedAccessToken = encrypt(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token
        ? encrypt(tokens.refresh_token)
        : integration.refresh_token; // Keep old refresh token if not provided

      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Update tokens in database
      const { error: updateError } = await supabase
        .from('imagetrend_integrations')
        .update({
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        logger.error('Failed to update tokens', {
          error: updateError.message,
          userId: user.id,
        });

        return NextResponse.json(
          { error: { code: 'UPDATE_FAILED', message: 'Failed to store refreshed token' } },
          { status: 500 }
        );
      }

      logger.info('Token refresh successful', {
        userId: user.id,
        agencyId: integration.agency_id,
      });

      return NextResponse.json({
        success: true,
        expires_at: expiresAt.toISOString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Token refresh error', { error: errorMessage, userId: user.id });

      return NextResponse.json(
        { error: { code: 'REFRESH_ERROR', message: 'Failed to refresh token' } },
        { status: 500 }
      );
    }
  },
  {
    loggerName: 'api.integrations.imagetrend.oauth.refresh',
    rateLimit: 'DEFAULT',
  }
);
