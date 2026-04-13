/**
 * app/api/auth/login/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST /api/auth/login
 *
 * Accepts { email, password }, forwards to the backend /auth/login,
 * extracts the JWT token from the response, and sets it as an
 * httpOnly cookie so all subsequent requests are authenticated.
 *
 * The frontend never sees the raw JWT — it lives server-side only.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isDev, getMockResponse } from '@/lib/devMode';
import { COOKIE_NAME, USER_ID_COOKIE, COOKIE_OPTIONS } from '@/lib/constants';

/** Backend base URL — reused from env, same logic as backendProxy */
function getBackendUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) throw new Error('NEXT_PUBLIC_API_URL is not set.');
  const trimmed = raw.trim().replace(/\/+$/, '');
  try {
    const url = new URL(trimmed);
    const isNgrok = /(^|\.)ngrok(-free)?\.app$/i.test(url.hostname);
    if (isNgrok && url.protocol === 'http:') { url.protocol = 'https:'; }
    return url.toString().replace(/\/+$/, '');
  } catch { return trimmed; }
}

/**
 * Decode a JWT payload segment without verifying the signature.
 * Used only to extract user_id from the token for the user_id cookie.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const base64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  try {
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch { return null; }
}

/**
 * Extract user_id from the backend response body or the JWT payload.
 * Tries body fields first, falls back to decoding the token.
 */
function extractUserId(data: Record<string, unknown>, token: string): number | null {
  // Try common response body locations first
  const candidate =
    data?.user_id ?? data?.id ??
    (data?.user as Record<string, unknown> | undefined)?.user_id ??
    (data?.user as Record<string, unknown> | undefined)?.id ??
    (data?.data as Record<string, unknown> | undefined)?.user_id;

  if (candidate !== undefined && candidate !== null) {
    const n = Number(candidate);
    if (Number.isFinite(n)) return n;
  }

  // Fallback: decode JWT and look for user_id / sub
  const payload = decodeJwtPayload(token);
  const fromToken = payload?.user_id ?? payload?.id ?? payload?.uid ?? payload?.sub;
  if (fromToken === undefined || fromToken === null) return null;
  const n = Number(fromToken);
  return Number.isFinite(n) ? n : null;
}

/** Write auth cookies — same options used for both real and dev tokens */
async function setAuthCookies(token: string, userId: number | null) {
  const jar = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  jar.set(COOKIE_NAME, token, { ...COOKIE_OPTIONS, secure: isProd });

  if (userId) {
    jar.set(USER_ID_COOKIE, String(userId), { ...COOKIE_OPTIONS, secure: isProd });
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ── Dev mode ────────────────────────────────────────────────────────────
    if (isDev()) {
      const mock = getMockResponse('/auth/login', 'POST', { email, password });
      if (!mock) return NextResponse.json({ message: 'Login failed' }, { status: 400 });

      if (mock.error) {
        return NextResponse.json({ message: mock.error }, { status: mock.status });
      }

      const data = mock.data as Record<string, unknown>;
      const token = (data?.token as string | undefined) ?? 'dev-token-12345';
      const user = data?.user as Record<string, unknown> | undefined;
      const userId = typeof user?.user_id === 'number' ? user.user_id : 1;

      await setAuthCookies(token, userId);
      return NextResponse.json({ ok: true });
    }

    // ── Production ─────────────────────────────────────────────────────────
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const json = await res.json().catch(() => null) as Record<string, unknown> | null;
        const message = (json?.message ?? json?.detail ?? 'Invalid credentials') as string;
        return NextResponse.json({ message }, { status: res.status });
      }
      const text = await res.text().catch(() => '');
      return NextResponse.json({ message: text || 'Invalid credentials' }, { status: res.status });
    }

    const data = await res.json() as Record<string, unknown>;

    // Backend may return token under different keys — check common ones
    const token = (data?.access_token ?? data?.token ?? data?.jwt ?? data?.accessToken) as string | undefined;
    if (!token) {
      return NextResponse.json({ message: 'Login succeeded but no token was returned' }, { status: 500 });
    }

    const userId = extractUserId(data, token);
    await setAuthCookies(token, userId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}