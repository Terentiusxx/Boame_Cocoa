/**
 * app/api/expert-auth/session/route.ts
 * GET /api/expert-auth/session — returns expert_id if authenticated.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE } from '@/lib/constants';

export async function GET() {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;

  if (!token || !expertId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, expert_id: Number(expertId) });
}
