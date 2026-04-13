/**
 * app/api/expert-auth/logout/route.ts
 * POST /api/expert-auth/logout — clears expert cookies only.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE } from '@/lib/constants';

export async function POST() {
  const jar = await cookies();
  jar.delete(EXPERT_COOKIE_NAME);
  jar.delete(EXPERT_ID_COOKIE);
  return NextResponse.json({ ok: true });
}
