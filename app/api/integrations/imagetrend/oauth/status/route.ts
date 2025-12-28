/**
 * ImageTrend OAuth Status Endpoint
 * GET /api/integrations/imagetrend/oauth/status
 *
 * Returns current connection status for ImageTrend integration
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../../../lib/api/handler';
import { authService } from '../../../../../../lib/auth/auth-service';
import { getSupabaseAdminClient } from '../../../../../../lib/db/client';
import { createLogger } from '../../../../../../lib/log';

const logger = createLogger('api.integrations.imagetrend.oauth.status');

interface StatusResponse {
  connected: boolean;
  agency_id?: string;
  expires_at?: string;
  is_expired?: boolean;
}

/**
 * GET /api/integrations/imagetrend/oauth/status
 * Check if ImageTrend is connected and token status
 */
export const GET = withApiHandler(
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

    // Get integration status from database
    const supabase = getSupabaseAdminClient();
    const { data: integration, error: fetchError } = await supabase
      .from('imagetrend_integrations')
      .select('agency_id, expires_at, connected_at')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !integration) {
      // Not connected
      logger.debug('No integration found', { userId: user.id });
      return NextResponse.json<StatusResponse>({ connected: false });
    }

    // Check if token is expired
    const expiresAt = new Date(integration.expires_at);
    const isExpired = expiresAt < new Date();

    const response: StatusResponse = {
      connected: true,
      agency_id: integration.agency_id,
      expires_at: integration.expires_at,
      is_expired: isExpired,
    };

    logger.debug('Integration status checked', {
      userId: user.id,
      agencyId: integration.agency_id,
      isExpired,
    });

    return NextResponse.json(response);
  },
  {
    loggerName: 'api.integrations.imagetrend.oauth.status',
    rateLimit: 'DEFAULT',
  }
);
