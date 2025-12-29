/**
 * User Preferences API
 * GET /api/user/preferences - Get preferences
 * PUT /api/user/preferences - Update preferences
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../lib/api/handler';
import { authService } from '../../../../lib/auth/auth-service';

// Default preferences
const DEFAULT_PREFERENCES = {
  theme: 'system',
  notificationsEnabled: true,
  notificationSound: true,
  criticalAlertsOnly: false,
  voiceInputEnabled: true,
  pushToTalk: true,
  offlineProtocolsEnabled: true,
  autoCacheFavorites: true,
  compactMode: false,
  largeText: false,
};

/**
 * GET /api/user/preferences
 * Get user preferences
 */
export const GET = withApiHandler(
  async (input: unknown, req: NextRequest) => {
    void input;
    const token = req.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return defaults - will query user_preferences table once migration is applied
    return NextResponse.json({ preferences: DEFAULT_PREFERENCES });
  },
  { loggerName: 'api.user.preferences' }
);

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
export const PUT = withApiHandler(
  async (input: unknown, req: NextRequest) => {
    void input;
    const token = req.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    // Placeholder - will use RPC function once migration is applied
    return NextResponse.json({ preferences: { ...DEFAULT_PREFERENCES, ...updates } });
  },
  { loggerName: 'api.user.preferences' }
);
