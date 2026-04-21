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

    // Forward optional geo-coordinates and required scan_id
    const formData = await req.formData();
    const qs = new URLSearchParams();
    const lat    = formData.get('latitude') as string | null;
    const lng    = formData.get('longitude') as string | null;
    const scanId = formData.get('scan_id') as string | null;
    if (lat)    qs.set('latitude', lat);
    if (lng)    qs.set('longitude', lng);
    if (scanId) qs.set('scan_id', scanId);

    const path = `/ai/voice-diagnose${qs.toString() ? `?${qs}` : ''}`;

    // Re-build form without scan_id / extra fields — send only the audio file
    const outForm = new FormData();
    const file = formData.get('file');
    if (file) outForm.append('file', file as Blob, 'voice.webm');

    const res = await backendFetch(path, { method: 'POST', body: outForm });

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
