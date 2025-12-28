/**
 * ImageTrend OAuth Revoke Endpoint
 * POST /api/integrations/imagetrend/oauth/revoke
 *
 * Revokes ImageTrend OAuth tokens and disconnects integration
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../../../lib/api/handler';
import { authService } from '../../../../../../lib/auth/auth-service';
import { getSupabaseAdminClient } from '../../../../../../lib/db/client';
import { createLogger } from '../../../../../../lib/log';
import { decrypt } from '../../../../../../lib/utils/encryption';

const logger = createLogger('api.integrations.imagetrend.oauth.revoke');

/**
 * POST /api/integrations/imagetrend/oauth/revoke
 * Disconnect ImageTrend integration and revoke tokens
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

    // Get stored tokens from database
    const supabase = getSupabaseAdminClient();
    const { data: integration, error: fetchError } = await supabase
      .from('imagetrend_integrations')
      .select('access_token, refresh_token, agency_id')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !integration) {
      logger.warn('No integration found to revoke', {
        userId: user.id,
        error: fetchError?.message,
      });

      // Still return success if already disconnected
      return NextResponse.json({ success: true, message: 'Already disconnected' });
    }

    // Optional: Revoke tokens with ImageTrend API if they provide a revocation endpoint
    const revokeUrl = process.env.IMAGETREND_REVOKE_URL;
    if (revokeUrl) {
      try {
        const accessToken = decrypt(integration.access_token);
        const clientId = process.env.IMAGETREND_CLIENT_ID;
        const clientSecret = process.env.IMAGETREND_CLIENT_SECRET;

        if (clientId && clientSecret) {
          await fetch(revokeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              token: accessToken,
              client_id: clientId,
              client_secret: clientSecret,
            }),
          });

          logger.info('Tokens revoked with ImageTrend', {
            userId: user.id,
            agencyId: integration.agency_id,
          });
        }
      } catch (err) {
        // Log error but don't fail the request - we'll delete locally anyway
        logger.warn('Failed to revoke tokens with ImageTrend API', {
          error: err instanceof Error ? err.message : 'Unknown error',
          userId: user.id,
        });
      }
    }

    // Delete integration from database
    const { error: deleteError } = await supabase
      .from('imagetrend_integrations')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      logger.error('Failed to delete integration', {
        error: deleteError.message,
        userId: user.id,
      });

      return NextResponse.json(
        { error: { code: 'DELETE_FAILED', message: 'Failed to disconnect integration' } },
        { status: 500 }
      );
    }

    logger.info('Integration disconnected', {
      userId: user.id,
      agencyId: integration.agency_id,
    });

    return NextResponse.json({
      success: true,
      message: 'ImageTrend integration disconnected',
    });
  },
  {
    loggerName: 'api.integrations.imagetrend.oauth.revoke',
    rateLimit: 'DEFAULT',
  }
);
