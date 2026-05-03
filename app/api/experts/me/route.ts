/**
 * app/api/experts/me/route.ts
 * GET  /api/experts/me  → backend GET /experts/profile/me
 * PUT  /api/experts/me  → backend PUT /experts/:id (multipart — image_file handled by backend → Cloudinary)
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE } from '@/lib/constants';

function getBackendUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
}

function toBearerHeader(token: string) {
  return /^bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

async function getExpertAuth(): Promise<{ token: string; expertId: number } | null> {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;
  if (!token || !expertId) return null;
  const n = Number(expertId);
  return Number.isFinite(n) && n > 0 ? { token, expertId: n } : null;
}

export async function GET() {
  const auth = await getExpertAuth();
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`${getBackendUrl()}/experts/profile/me`, {
      headers: { Authorization: toBearerHeader(auth.token) },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'Failed to load profile' }, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await getExpertAuth();
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    // Forward multipart form data as-is — backend handles Cloudinary via image_file
    const formData = await req.formData();

    const res = await fetch(`${getBackendUrl()}/experts/${auth.expertId}`, {
      method: 'PUT',
      headers: { Authorization: toBearerHeader(auth.token) },
      body: formData, // pass multipart directly
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? { message: 'Update failed' }, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Update failed' }, { status: 500 });
  }
}
