/**
 * app/api/users/me/route.ts
 * GET    /api/users/me  → backend GET /users/me
 * PATCH  /api/users/me  → backend PATCH /users/:userId (partial profile update)
 * PUT    /api/users/me  → backend PUT /users/:userId (full profile update)
 * DELETE /api/users/me  → backend DELETE /users/:userId
 *
 * The backend has a /users/me endpoint. We prefer it directly.
 * For PUT/DELETE we still need the userId, so we use the cookie.
 */
import { backendFetch, proxyBackendJson } from '@/lib/backendProxy';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, USER_ID_COOKIE } from '@/lib/constants';

/** Get userId from user_id cookie (set during login) */
async function getUserIdFromCookie(): Promise<number | null> {
  const value = (await cookies()).get(USER_ID_COOKIE)?.value;
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET() {
  // /users/me is a standard REST endpoint — proxy directly
  return proxyBackendJson('/users/me');
}

export async function PUT(req: Request) {
  try {
    // Need userId to build the update path
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    return proxyBackendJson(`/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') ?? '';

    // Forward multipart raw bytes — do NOT re-parse with formData() because
    // re-serialising generates a new boundary that FastAPI rejects.
    if (contentType.includes('multipart/form-data')) {
      const res = await backendFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': contentType }, // preserve original boundary
        body: await req.arrayBuffer(),             // raw bytes, no re-encoding
      });
      if (res.status === 204) return new NextResponse(null, { status: 204 });
      const data = await res.json().catch(() => null);
      return NextResponse.json(data ?? { message: res.ok ? 'OK' : 'Update failed' }, { status: res.status });
    }

    // JSON fallback
    const body = await req.json().catch(() => ({}));
    return proxyBackendJson(`/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const res = await backendFetch(`/users/${userId}`, { method: 'DELETE' });

    // 204 No Content — return empty response with correct status
    if (res.status === 204) return new NextResponse(null, { status: 204 });

    // Use the result from the single DELETE call — do NOT call backendFetch again
    const data = await res.json().catch(() => null);
    return NextResponse.json(
      data ?? { message: res.ok ? 'Deleted' : 'Delete failed' },
      { status: res.status }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
