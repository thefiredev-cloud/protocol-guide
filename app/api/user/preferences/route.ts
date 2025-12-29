import { NextRequest, NextResponse } from 'next/server';

import { createRouteClient } from '../../../../lib/supabase/server';

/**
 * GET /api/user/preferences
 * Get user preferences
 */
export async function GET() {
  try {
    const supabase = await createRouteClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('get_user_preferences');

    if (error) {
      // If function doesn't exist, return defaults
      console.warn('[Preferences GET] RPC error, using defaults:', error.message);

      return NextResponse.json({
        preferences: {
          theme: 'system',
          notifications_enabled: true,
          notification_sound: true,
          critical_alerts_only: false,
          voice_input_enabled: true,
          push_to_talk: true,
          offline_protocols_enabled: true,
          auto_cache_favorites: true,
          compact_mode: false,
          large_text: false,
        }
      });
    }

    return NextResponse.json({ preferences: data });
  } catch (err) {
    console.error('[Preferences GET] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    const { data, error } = await supabase.rpc('update_user_preferences', {
      p_updates: updates,
    });

    if (error) {
      console.error('[Preferences PUT] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch (err) {
    console.error('[Preferences PUT] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
