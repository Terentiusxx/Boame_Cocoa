/**
 * app/api/expert-auth/login/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST /api/expert-auth/login
 *
 * Experts log in through the same backend /auth/login endpoint.
 * On success, stores expert_token + expert_id cookies separately 
 * from the user session so both can coexist without collision.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, COOKIE_OPTIONS } from '@/lib/constants';

function getBackendUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) throw new Error('NEXT_PUBLIC_API_URL is not set');
  const trimmed = raw.trim().replace(/\/+$/, '');
  try {
    const url = new URL(trimmed);
    if (/(^|\.)ngrok(-free)?\.app$/i.test(url.hostname) && url.protocol === 'http:') url.protocol = 'https:';
    return url.toString().replace(/\/+$/, '');
  } catch { return trimmed; }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const base64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
  const padded  = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  try { return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')); }
  catch { return null; }
}

function extractExpertId(data: Record<string, unknown>, token: string): number | null {
  // Try response body fields first
  const candidate =
    data?.expert_id ??
    (data?.expert as Record<string, unknown> | undefined)?.expert_id ??
    (data?.data   as Record<string, unknown> | undefined)?.expert_id;

  if (candidate != null) {
    const n = Number(candidate);
    if (Number.isFinite(n) && n > 0) return n;
  }

  // Fallback: decode JWT
  const payload = decodeJwtPayload(token);
  const fromToken = payload?.expert_id ?? payload?.sub;
  if (fromToken == null) return null;
  const n = Number(fromToken);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const res  = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null) as Record<string, unknown> | null;
      const message = (payload?.message ?? payload?.detail ?? 'Invalid credentials') as string;
      return NextResponse.json({ message }, { status: res.status });
    }

    const data  = await res.json() as Record<string, unknown>;
    const token = (data?.access_token ?? data?.token ?? data?.jwt) as string | undefined;

    if (!token) {
      return NextResponse.json({ message: 'No token returned' }, { status: 500 });
    }

    const expertId = extractExpertId(data, token);

    if (!expertId) {
      // Could also check role field here if needed
      return NextResponse.json({ message: 'This account is not an expert account.' }, { status: 403 });
    }

    const jar    = await cookies();
    const isProd = process.env.NODE_ENV === 'production';

    jar.set(EXPERT_COOKIE_NAME, token,           { ...COOKIE_OPTIONS, secure: isProd });
    jar.set(EXPERT_ID_COOKIE,   String(expertId), { ...COOKIE_OPTIONS, secure: isProd });

    return NextResponse.json({ ok: true, expert_id: expertId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
