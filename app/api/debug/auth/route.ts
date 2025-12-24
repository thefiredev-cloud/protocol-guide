/**
 * Debug endpoint for auth troubleshooting
 * TEMPORARY - REMOVE AFTER FIXING
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug: Record<string, unknown> = {};

  try {
    // Check env vars
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    debug.hasUrl = !!url;
    debug.hasServiceKey = !!serviceKey;
    debug.serviceKeyLength = serviceKey?.length ?? 0;
    debug.serviceKeyPrefix = serviceKey?.substring(0, 30) ?? 'MISSING';

    if (!url || !serviceKey) {
      return NextResponse.json({
        error: 'Missing credentials',
        debug,
      }, { status: 500 });
    }

    // Create client
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // Test query
    const testUserId = 'b394245e-e198-4e78-b384-e331ae3b50b3';
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, station_id')
      .eq('id', testUserId)
      .single();

    debug.queryError = error?.message ?? null;
    debug.queryErrorCode = error?.code ?? null;
    debug.hasData = !!data;
    debug.userData = data ? {
      id: data.id,
      email: data.email,
      role: data.role,
    } : null;

    return NextResponse.json({
      success: !error && !!data,
      debug,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      debug,
    }, { status: 500 });
  }
}

// Test login endpoint
export async function POST(req: Request) {
  const debug: Record<string, unknown> = {};

  try {
    const body = await req.json();
    const { email, password, captchaToken } = body;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // Step 1: Sign in
    debug.step = 'signInWithPassword';
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (authError) {
      debug.authError = authError.message;
      debug.authErrorCode = authError.status;
      return NextResponse.json({ error: 'Auth failed', debug }, { status: 401 });
    }

    debug.authSuccess = true;
    debug.userId = authData.user?.id;

    // Step 2: Get user profile
    debug.step = 'getUserProfile';
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, station_id')
      .eq('id', authData.user?.id ?? '')
      .single();

    if (userError) {
      debug.userError = userError.message;
      debug.userErrorCode = userError.code;
      debug.userErrorDetails = userError.details;
      return NextResponse.json({ error: 'User profile failed', debug }, { status: 500 });
    }

    debug.userSuccess = true;
    debug.userData = userData;

    return NextResponse.json({ success: true, debug });
  } catch (err) {
    debug.catchError = err instanceof Error ? err.message : String(err);
    debug.catchStack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({ error: 'Exception', debug }, { status: 500 });
  }
}
