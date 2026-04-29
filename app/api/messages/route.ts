/**
 * app/api/messages/route.ts
 * GET  /api/messages → backend GET /messages (list threads for current user)
 * POST /api/messages → backend POST /messages (create message)
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { proxyBackendJson } from '@/lib/backendProxy';
import { COOKIE_NAME, EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, USER_ID_COOKIE } from '@/lib/constants';

export async function GET() {
  return proxyBackendJson('/messages');
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

export async function POST(req: Request) {
  const jar = await cookies();
  const userToken = jar.get(COOKIE_NAME)?.value;
  const expertToken = jar.get(EXPERT_COOKIE_NAME)?.value;
  const token = expertToken ?? userToken;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    consultation_id?: number;
    content?: string;
    message_type?: string;
    sender_id?: number;
  };

  const senderFromCookie = Number(jar.get(EXPERT_ID_COOKIE)?.value ?? jar.get(USER_ID_COOKIE)?.value);
  const senderId = body.sender_id
    ?? (Number.isFinite(senderFromCookie) && senderFromCookie > 0 ? senderFromCookie : undefined)
    ?? decodeIdFromToken(token);

  if (!senderId) {
    return NextResponse.json({ message: 'Missing sender_id' }, { status: 400 });
  }

  return proxyBackendJson('/messages', {
    method: 'POST',
    headers: {
      Authorization: toBearerHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consultation_id: body.consultation_id,
      content: body.content ?? '',
      message_type: body.message_type ?? 'text',
      sender_id: senderId,
    }),
  });
}
