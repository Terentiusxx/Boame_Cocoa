/**
 * app/api/experts/my-consultations/[id]/route.ts
 * GET    /api/experts/my-consultations/:id → GET /experts/consultations/:id
 * PATCH  accept → PATCH /experts/consultations/:id/accept
 * PATCH  resolve → PATCH /experts/consultations/:id/resolve
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPERT_COOKIE_NAME } from '@/lib/constants';

function getBackendUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
}

async function getToken() {
  return (await cookies()).get(EXPERT_COOKIE_NAME)?.value;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const token   = await getToken();
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const res  = await fetch(`${getBackendUrl()}/experts/consultations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token  = await getToken();
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Determine action from request body: { action: 'accept' | 'resolve', resolution_note? }
  const body   = await req.json().catch(() => ({}) ) as { action?: string; resolution_note?: string };
  const action = body.action ?? 'accept';
  const validActions = ['accept', 'resolve'];

  if (!validActions.includes(action)) {
    return NextResponse.json({ message: `Invalid action: ${action}` }, { status: 400 });
  }

  try {
    const res = await fetch(`${getBackendUrl()}/experts/consultations/${id}/${action}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body.resolution_note ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body.resolution_note ? { body: JSON.stringify({ resolution_note: body.resolution_note }) } : {}),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
