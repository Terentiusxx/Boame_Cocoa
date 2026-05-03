/**
 * app/api/scans/route.ts
 * POST /api/scans → backend POST /scans
 *
 * Creates a scan record in the backend and registers it in history.
 * Called by the image upload flow (not the AI predict flow — that uses /api/ai/predict).
 */
import { backendFetch, proxyBackendJson } from '@/lib/backendProxy';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_ID_COOKIE } from '@/lib/constants';
import { unwrapData } from '@/lib/utils';

/** Resolve user ID from cookie or dashboard fallback */
async function getUserId(): Promise<number | null> {
  const fromCookie = (await cookies()).get(USER_ID_COOKIE)?.value;
  if (fromCookie) {
    const n = Number(fromCookie);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const res = await backendFetch('/users/dashboard');
  if (!res.ok) return null;
  const data = unwrapData(await res.json().catch(() => null)) as Record<string, unknown> | null;
  const id = data?.user_id ?? data?.id ?? (data?.user as Record<string, unknown> | undefined)?.user_id;
  return id ? Number(id) : null;
}

/** Extract scan_id from any backend response shape */
function extractScanId(payload: unknown): number | null {
  const data = unwrapData(payload as { data?: unknown }) ?? payload;
  const candidate = (data as Record<string, unknown>)?.scan_id ?? (data as Record<string, unknown>)?.id;
  const n = Number(candidate);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET() {
  return proxyBackendJson('/scans');
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}) as Record<string, unknown>) as Record<string, unknown>;

    const userId = (typeof payload.user_id === 'number' ? payload.user_id : null) ?? await getUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized — could not resolve user_id' }, { status: 401 });
    }

    const imageUrl = (typeof payload.image_url === 'string' ? payload.image_url : '') ||
                     (typeof payload.imageDataUrl === 'string' ? payload.imageDataUrl : '');
    if (!imageUrl) {
      return NextResponse.json({ message: 'image_url is required' }, { status: 400 });
    }

    const body: Record<string, unknown> = {
      user_id: userId,
      image_url: imageUrl,
      // Optional fields — only include if provided
      ...(typeof payload.custom_label    === 'string' ? { custom_label:    payload.custom_label    } : {}),
      ...(typeof payload.latitude        === 'number' ? { latitude:        payload.latitude        } : {}),
      ...(typeof payload.longitude       === 'number' ? { longitude:       payload.longitude       } : {}),
      ...(typeof payload.disease_id      === 'number' ? { disease_id:      payload.disease_id      } : {}),
      ...(typeof payload.confidence_score === 'number' ? { confidence_score: payload.confidence_score } : {}),
    };

    const res = await backendFetch('/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);

    // Best-effort: register the scan in history so it appears on the home screen
    if (res.ok) {
      const scanId = extractScanId(json);
      if (scanId) {
        // Single attempt — history registration is non-critical
        await backendFetch(`/history/${userId}/${scanId}`, { method: 'POST' }).catch(() => null);
      }
    }

    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
