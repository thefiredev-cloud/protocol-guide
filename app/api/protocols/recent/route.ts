import { NextRequest, NextResponse } from 'next/server';

import { createRouteClient } from '../../../../lib/supabase/server';

/**
 * GET /api/protocols/recent
 * Get user's recently viewed protocols
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const { data, error } = await supabase.rpc('get_recently_viewed', {
      p_limit: limit,
    });

    if (error) {
      console.error('[Recent GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recent: data });
  } catch (err) {
    console.error('[Recent GET] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/protocols/recent
 * Record a protocol view
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

    const { data, error } = await supabase.rpc('record_protocol_view', {
      p_protocol_id: protocolId,
      p_protocol_title: protocolTitle || null,
      p_protocol_code: protocolCode || null,
      p_category: category || null,
    });

    if (error) {
      console.error('[Recent POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[Recent POST] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
