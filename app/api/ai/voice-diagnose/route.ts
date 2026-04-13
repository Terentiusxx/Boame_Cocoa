/**
 * app/api/ai/voice-diagnose/route.ts
 * POST /api/ai/voice-diagnose → backend POST /ai/voice-diagnose
 *
 * Accepts a multipart form with `file` (audio blob), forwards to backend.
 */
import { backendFetch } from '@/lib/backendProxy';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    // Require auth in production
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token && process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Forward optional geo-coordinates
    const { searchParams } = new URL(req.url);
    const qs = new URLSearchParams();
    const lat = searchParams.get('latitude');
    const lng = searchParams.get('longitude');
    if (lat) qs.set('latitude', lat);
    if (lng) qs.set('longitude', lng);

    const path = `/ai/voice-diagnose${qs.toString() ? `?${qs}` : ''}`;

    // Pass the raw audio form data straight through
    const contentType = req.headers.get('content-type');
    const body = await req.arrayBuffer();
    const headers = new Headers();
    if (contentType) headers.set('content-type', contentType);

    const res = await backendFetch(path, { method: 'POST', headers, body });

    const contentTypeRes = res.headers.get('content-type') ?? '';
    if (contentTypeRes.includes('application/json')) {
      const json = await res.json().catch(() => null);
      return NextResponse.json(json ?? { message: 'Invalid JSON from backend' }, {
        status: res.status,
      });
    }

    const text = await res.text().catch(() => '');
    return NextResponse.json(
      { message: text || (res.ok ? 'OK' : 'Request failed') },
      { status: res.status }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Voice diagnose failed' },
      { status: 500 }
    );
  }
}
