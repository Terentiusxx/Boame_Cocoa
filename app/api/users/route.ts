/**
 * app/api/users/route.ts
 * POST /api/users → backend POST /users (create account / signup)
 *
 * The backend may expect either JSON or form-urlencoded body.
 * We detect a 422 "all body fields missing" response and automatically
 * retry as form-urlencoded — this handles FastAPI Form() vs Body() schemas.
 */
import { backendFetch } from '@/lib/backendProxy';
import { NextResponse } from 'next/server';

/** Check if a FastAPI 422 means the body encoding format was wrong */
function isMissingBodyFields422(payload: unknown): boolean {
  const detail = (payload as Record<string, unknown>)?.detail;
  if (!Array.isArray(detail) || detail.length === 0) return false;
  return detail.every((item: Record<string, unknown>) =>
    item?.type === 'missing' && Array.isArray(item?.loc) && (item.loc as string[])[0] === 'body'
  );
}

/** Convert a backend Response to a NextResponse, preserving status and JSON body */
async function toNextResponse(res: Response): Promise<NextResponse> {
  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'Invalid JSON from backend' }, {
      status: res.status,
    });
  }

  const text = await res.text().catch(() => '');
  return NextResponse.json(
    { message: text || (res.ok ? 'OK' : 'Request failed') },
    { status: res.status }
  );
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    // ── Multipart form (profile image upload) ───────────────────────────────
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const form = new URLSearchParams();

      // Convert to url-encoded — file/blob fields are skipped (image sent as data URL string)
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') form.set(key, value);
      }

      const res = await backendFetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      return toNextResponse(res);
    }

    // ── JSON body ────────────────────────────────────────────────────────────
    const rawBody = await req.text().catch(() => '');

    const firstRes = await backendFetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': contentType || 'application/json' },
      body: rawBody || undefined,
    });

    const firstPayload = await firstRes.clone().json().catch(() => null);

    // If JSON was rejected with 422 "all body fields missing" → retry as form-urlencoded
    // Some FastAPI endpoints define fields as Form() instead of Body()
    if (firstRes.status === 422 && isMissingBodyFields422(firstPayload)) {
      const asJson = JSON.parse(rawBody || '{}') as Record<string, unknown>;
      const form = new URLSearchParams();

      for (const [key, value] of Object.entries(asJson)) {
        if (value === undefined || value === null || typeof value === 'object') continue;
        form.set(key, String(value));
      }

      const retryRes = await backendFetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      return toNextResponse(retryRes);
    }

    return toNextResponse(firstRes);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    );
  }
}
