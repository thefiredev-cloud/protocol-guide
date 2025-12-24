/**
 * Next.js Middleware for Route Protection
 * Validates JWT tokens and protects authenticated routes
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/api/chat',
  '/api/dosing',
  '/api/audit',
  '/api/admin',
];

/**
 * Routes that are always public
 */
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/health',
  '/api/debug', // TEMPORARY - remove after debugging
  '/login',
  '/_next',
  '/static',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icon',
  '/kb',
];

/**
 * Check if a route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  // Check if it's explicitly public
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return false;
  }

  // Exact matches for public routes that doesn't start with /
  if (PUBLIC_ROUTES.includes(pathname)) {
    return false;
  }

  // All other routes require auth
  return true;
}

/**
 * Middleware function for request processing
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public routes
  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  // Extract token from header or cookie
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get('sb-access-token')?.value;
  const token = authHeader?.replace('Bearer ', '') ?? cookieToken;

  // No token - redirect or return 401
  if (!token) {
    // Redirect to login for browser requests
    if (req.headers.get('accept')?.includes('text/html')) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API requests
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  // Validate JWT with Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Auth not configured - allow in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    return NextResponse.json(
      { error: { code: 'AUTH_NOT_CONFIGURED', message: 'Authentication not configured' } },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    // Token invalid or expired
    if (req.headers.get('accept')?.includes('text/html')) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return response;
    }

    return NextResponse.json(
      { error: { code: 'TOKEN_EXPIRED', message: 'Session expired' } },
      { status: 401 }
    );
  }

  // Attach user info to request headers for downstream handlers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-email', user.email ?? '');

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

/**
 * Middleware configuration
 * Match all routes except static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (manifest.json, sw.js, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.svg).*)',
  ],
};
