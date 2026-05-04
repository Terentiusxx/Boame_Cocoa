/**
 * app/api/messages/route.ts
 * GET  /api/messages → backend GET /messages/messages/conversations
 * POST /api/messages → backend POST /messages/messages/ (send a message)
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { proxyBackendJson } from '@/lib/backendProxy';
import { COOKIE_NAME, EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, USER_ID_COOKIE } from '@/lib/constants';

export async function GET() {
  return proxyBackendJson('/messages/messages/conversations');
}

function toBearerHeader(token: string) {
  return /^bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

function decodeIdFromToken(token: string): number | undefined {
  try {
    const payloadSeg = token.split('.')[1];
    if (!payloadSeg) return undefined;
    const payload = JSON.parse(Buffer.from(payloadSeg, 'base64url').toString('utf8')) as Record<string, unknown>;
    const rawId = payload?.expert_id ?? payload?.user_id ?? payload?._id ?? payload?.sub;
    const id = Number(rawId);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  } catch {
    return undefined;
  }
}

type SenderRole = 'user' | 'expert';

function isSenderRole(value: unknown): value is SenderRole {
  return value === 'user' || value === 'expert';
}

export async function POST(req: Request) {
  const jar = await cookies();
  const userToken = jar.get(COOKIE_NAME)?.value;
  const expertToken = jar.get(EXPERT_COOKIE_NAME)?.value;

  const body = await req.json().catch(() => ({})) as {
    consultation_id?: number;
    content?: string;
    message_type?: string;
    sender_role?: SenderRole;
  };

  // Determine which session should be used for this send.
  // Default: prefer user session; fall back to expert session.
  const role: SenderRole | undefined = isSenderRole(body.sender_role)
    ? body.sender_role
    : (userToken ? 'user' : expertToken ? 'expert' : undefined);

  const token = role === 'expert' ? expertToken : userToken;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const consultationId = Number(body.consultation_id);
  if (!Number.isFinite(consultationId) || consultationId <= 0) {
    return NextResponse.json({ message: 'Missing consultation_id' }, { status: 400 });
  }

  const content = (body.content ?? '').trim();
  if (!content) {
    return NextResponse.json({ message: 'Message content cannot be empty' }, { status: 400 });
  }

  const rawType = body.message_type ?? 'text';
  const messageType = (rawType === 'text' || rawType === 'image' || rawType === 'file') ? rawType : 'text';

  // Standard practice: derive sender_id on the server.
  const senderFromCookie = role === 'expert'
    ? Number(jar.get(EXPERT_ID_COOKIE)?.value)
    : Number(jar.get(USER_ID_COOKIE)?.value);

  const senderId = (Number.isFinite(senderFromCookie) && senderFromCookie > 0)
    ? senderFromCookie
    : decodeIdFromToken(token);

  if (!senderId) {
    return NextResponse.json({ message: 'Unauthorized — could not resolve sender_id' }, { status: 401 });
  }

  const init: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: toBearerHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consultation_id: consultationId,
      content,
      message_type: messageType,
      sender_id: senderId,
    }),
  };

  // Primary: backend POST /messages/messages/ (current backend contract)
  const primary = await proxyBackendJson('/messages/messages/', init);
  if (primary.status !== 404 && primary.status !== 405) return primary;

  // Fallback: some backends use POST /messages/:consultationId
  return proxyBackendJson(`/messages/messages/consultation/${consultationId}`, init);
}
