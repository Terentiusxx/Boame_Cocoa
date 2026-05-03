/**
 * app/api/history/route.ts
 * GET /api/history → backend GET /history/:userId
 *
 * Resolves the current user's ID from the cookie, then fetches their
 * scan history from the backend. Supports optional `?limit=` query param.
 */
import { backendFetch, proxyBackendJson } from '@/lib/backendProxy';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_ID_COOKIE } from '@/lib/constants';

/** Resolve user ID from cookie (fast) or dashboard (fallback) */
async function getUserId(): Promise<number | null> {
  const fromCookie = (await cookies()).get(USER_ID_COOKIE)?.value;
  if (fromCookie) {
    const n = Number(fromCookie);
    if (Number.isFinite(n) && n > 0) return n;
  }

  // Fallback: fetch dashboard to get user_id
  const res = await backendFetch('/users/dashboard');
  if (!res.ok) return null;
  const data = await res.json().catch(() => null) as Record<string, unknown> | null;
  const id = data?.user_id ?? data?.id ??
    (data?.data as Record<string, unknown> | undefined)?.user_id ??
    (data?.user as Record<string, unknown> | undefined)?.user_id;
  return id ? Number(id) : null;
}

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ?? '50';

    return proxyBackendJson(`/history/me?limit=${encodeURIComponent(limit)}`);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
