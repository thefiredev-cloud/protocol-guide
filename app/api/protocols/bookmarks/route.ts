import { NextRequest, NextResponse } from 'next/server';

import { createRouteClient } from '../../../../lib/supabase/server';

/**
 * GET /api/protocols/bookmarks
 * Get user's bookmarked protocols
 */
export async function GET() {
  try {
    const supabase = await createRouteClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('protocol_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Bookmarks GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookmarks: data });
  } catch (err) {
    console.error('[Bookmarks GET] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/protocols/bookmarks
 * Toggle bookmark for a protocol
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { protocolId, protocolTitle, protocolCode, category } = body;

    if (!protocolId) {
      return NextResponse.json({ error: 'protocolId is required' }, { status: 400 });
    }

    // Use the toggle function from the database
    const { data, error } = await supabase.rpc('toggle_protocol_bookmark', {
      p_protocol_id: protocolId,
      p_protocol_title: protocolTitle || null,
      p_protocol_code: protocolCode || null,
      p_category: category || null,
    });

    if (error) {
      console.error('[Bookmarks POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[Bookmarks POST] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
