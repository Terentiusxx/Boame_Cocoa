/**
 * app/api/experts/register/route.ts
 * POST /api/experts/register
 *
 * Creates a new expert account. Backend accepts multipart/form-data
 * with an optional image_file binary — David's server handles Cloudinary.
 * We forward the FormData as-is without re-encoding.
 */
import { NextResponse } from 'next/server';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, COOKIE_OPTIONS } from '@/lib/constants';
import { cookies } from 'next/headers';

function getBackendUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) throw new Error('NEXT_PUBLIC_API_URL is not set');
  return raw.trim().replace(/\/+$/, '');
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const b64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
  try { return JSON.parse(Buffer.from(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='), 'base64').toString()); }
  catch { return null; }
}

export async function POST(req: Request) {
  try {
    // Forward the FormData as-is — DO NOT call req.json() here as body is multipart
    const formData = await req.formData();
    const email    = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. Create the expert account
    const createRes = await fetch(`${getBackendUrl()}/experts/`, {
      method: 'POST',
      body: formData, // pass multipart body (with image_file) directly
    });

    if (!createRes.ok) {
      const payload = await createRes.json().catch(() => null) as Record<string, unknown> | null;
      const message = (payload?.detail ?? payload?.message ?? 'Registration failed') as string;
      return NextResponse.json({ message }, { status: createRes.status });
    }

    const created = await createRes.json() as Record<string, unknown>;

    // 2. Auto-login the expert using their credentials
    const loginRes = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      // Account created but auto-login failed — still a success, client can login manually
      return NextResponse.json({ ok: true, autoLogin: false, data: created });
    }

    const loginData = await loginRes.json() as Record<string, unknown>;
    const token     = (loginData?.access_token ?? loginData?.token) as string | undefined;
    const expertId  = Number(
      (created as Record<string, unknown>)?.data
        ? ((created as { data: Record<string, unknown> }).data?.expert_id)
        : (created as Record<string, unknown>)?.expert_id
    );

    if (token && expertId > 0) {
      const jar    = await cookies();
      const isProd = process.env.NODE_ENV === 'production';
      jar.set(EXPERT_COOKIE_NAME, token,           { ...COOKIE_OPTIONS, secure: isProd });
      jar.set(EXPERT_ID_COOKIE,   String(expertId), { ...COOKIE_OPTIONS, secure: isProd });
    }

    const payload = decodeJwtPayload(token ?? '');
    void payload; // satisfies linter

    return NextResponse.json({ ok: true, autoLogin: true, expert_id: expertId });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
