/**
 * app/api/ai/predict/route.ts
 * POST /api/ai/predict → backend POST /ai/predict
 *
 * Accepts a multipart form with `file` (image blob), forwards to the backend
 * AI prediction endpoint, and registers the scan in history on success.
 */
import { backendFetch } from '@/lib/backendProxy';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAME, USER_ID_COOKIE } from '@/lib/constants';
import { unwrapData } from '@/lib/utils';

/** Extract scan_id from any backend prediction response shape */
function extractScanId(payload: unknown): number | null {
  const data = unwrapData(payload as { data?: unknown }) ?? payload;
  const candidate = (data as Record<string, unknown>)?.scan_id ?? (data as Record<string, unknown>)?.id;
  const n = Number(candidate);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Get userId from cookie (fastest) or dashboard API (fallback) */
async function getUserId(): Promise<number | null> {
  const fromCookie = (await cookies()).get(USER_ID_COOKIE)?.value;
  if (fromCookie) {
    const n = Number(fromCookie);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const res = await backendFetch('/users/dashboard');
  if (!res.ok) return null;
  const data = await res.json().catch(() => null) as Record<string, unknown> | null;
  const id = data?.user_id ?? data?.id ??
    (data?.data as Record<string, unknown> | undefined)?.user_id ??
    (data?.user as Record<string, unknown> | undefined)?.user_id;
  return id ? Number(id) : null;
}

export async function POST(req: Request) {
  try {
    // Require auth in production — dev mode skips this
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token && process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Forward optional geo-coordinates from the query string
    const { searchParams } = new URL(req.url);
    const qs = new URLSearchParams();
    const lat = searchParams.get('latitude');
    const lng = searchParams.get('longitude');
    if (lat) qs.set('latitude', lat);
    if (lng) qs.set('longitude', lng);

    const path = `/ai/predict${qs.toString() ? `?${qs}` : ''}`;

    // Pass the raw body (multipart form with image) straight through to backend
    const contentType = req.headers.get('content-type');
    const body = await req.arrayBuffer();
    const headers = new Headers();
    if (contentType) headers.set('content-type', contentType);

    const res = await backendFetch(path, { method: 'POST', headers, body });

    const contentTypeRes = res.headers.get('content-type') ?? '';
    if (!contentTypeRes.includes('application/json')) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { message: text || (res.ok ? 'OK' : 'Request failed') },
        { status: res.status }
      );
    }

    const json = await res.json().catch(() => null);

    // Best-effort: save scan to history so it shows up on the home page
    if (res.ok) {
      const scanId = extractScanId(json);
      if (scanId) {
        const userId = await getUserId();
        if (userId) {
          await backendFetch(`/history/${userId}/${scanId}`, { method: 'POST' }).catch(() => null);
        }
      }
    }

    return NextResponse.json(json ?? { message: 'Invalid JSON from backend' }, {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Prediction failed' },
      { status: 500 }
    );
  }
}
