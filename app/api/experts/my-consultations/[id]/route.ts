/**
 * app/api/experts/my-consultations/[id]/route.ts
 * GET    /api/experts/my-consultations/:id → GET /experts/consultations/:id
 * PATCH  accept → PATCH /experts/consultations/:id/accept
 * PATCH  resolve → PATCH /experts/consultations/:id/resolve
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { proxyBackendJson } from '@/lib/backendProxy';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE } from '@/lib/constants';

function toBearerHeader(token: string) {
  return /^bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

async function getToken() {
  return (await cookies()).get(EXPERT_COOKIE_NAME)?.value;
}

async function getExpertId() {
  return (await cookies()).get(EXPERT_ID_COOKIE)?.value;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const token   = await getToken();
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  return proxyBackendJson(`/experts/consultations/${id}`, {
    headers: { Authorization: toBearerHeader(token) },
  });
}

function decodeExpertIdFromToken(token: string): string | undefined {
  try {
    const payloadSeg = token.split('.')[1];
    if (!payloadSeg) return undefined;

    const payload = JSON.parse(Buffer.from(payloadSeg, 'base64url').toString('utf8')) as Record<string, unknown>;
    const id      = payload?.expert_id ?? payload?._id ?? payload?.sub;
    const n       = Number(id);
    return Number.isFinite(n) && n > 0 ? String(n) : undefined;
  } catch { return undefined; }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id }   = await params;
  const token    = await getToken();
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Read expert_id from cookie, fall back to decoding it from the JWT
  const expertId = (await getExpertId()) ?? decodeExpertIdFromToken(token);
  const expertIdNum = Number(expertId);
  if (!Number.isFinite(expertIdNum) || expertIdNum <= 0) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Determine action from request body: { action: 'accept' | 'resolve', message?, resolution_note? }
  const body   = await req.json().catch(() => ({}) ) as { action?: string; message?: string; resolution_note?: string };
  const action = body.action ?? 'accept';
  const validActions = ['accept', 'resolve'];

  if (!validActions.includes(action)) {
    return NextResponse.json({ message: `Invalid action: ${action}` }, { status: 400 });
  }

  // Build body — expert_id always included.
  // Accept may require a message; resolve may include resolution_note.
  const bodyPayload: Record<string, unknown> = { expert_id: expertIdNum };
  if (action === 'accept' && typeof body.message === 'string' && body.message.trim()) {
    bodyPayload.message = body.message.trim();
  }
  if (action === 'resolve' && body.resolution_note) {
    bodyPayload.resolution_note = body.resolution_note;
  }

  return proxyBackendJson(`/experts/consultations/${id}/${action}`, {
    method: 'PATCH',
    headers: {
      Authorization: toBearerHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });
}
