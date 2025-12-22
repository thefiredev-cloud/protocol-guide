/**
 * Login API Endpoint
 * POST /api/auth/login - Authenticate user with email and password
 * Protected by Cloudflare Turnstile CAPTCHA
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { withApiHandler } from '@/lib/api/handler';
import { authService } from '@/lib/auth/auth-service';
import { verifyCaptcha } from '@/lib/auth/captcha';
import { SESSION_TIMEOUT_MS } from '@/lib/auth/types';

/**
 * Login request schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  captchaToken: z.string().optional(),
});

type LoginInput = z.infer<typeof loginSchema>;

/**
 * POST /api/auth/login
 * Authenticate user and return session tokens
 */
export const POST = withApiHandler<LoginInput>(
  async (input, req) => {
    const ipAddress = req.headers.get('x-forwarded-for') ?? undefined;

    // hCaptcha verification is handled built-in by Supabase Auth
    // via authService.login which passes the token to signInWithPassword
    if (process.env.NODE_ENV === 'production' && !input.captchaToken) {
      return NextResponse.json(
        { error: { code: 'CAPTCHA_REQUIRED', message: 'CAPTCHA verification required' } },
        { status: 400 }
      );
    }

    const ctx = {
      ipAddress,
      userAgent: req.headers.get('user-agent') ?? undefined,
    };

    const session = await authService.login(input, ctx, input.captchaToken);

    const response = NextResponse.json({
      user: session.user,
      expiresAt: session.expiresAt,
    });

    // Set HTTP-only cookies for session tokens
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAgeSeconds = Math.floor(SESSION_TIMEOUT_MS / 1000);

    response.cookies.set('sb-access-token', session.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: maxAgeSeconds,
      path: '/',
    });

    response.cookies.set('sb-refresh-token', session.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  },
  {
    schema: loginSchema,
    rateLimit: 'AUTH',
    loggerName: 'api.auth.login',
  }
);
