/**
 * app/api/auth/logout/route.ts
 * POST /api/auth/logout → clears auth cookies and optionally notifies backend
 *
 * The frontend calls this, then redirects to /login.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, USER_ID_COOKIE } from '@/lib/constants';

export async function POST() {
  const jar = await cookies();

  // Clear both auth cookies — user is now logged out
  jar.delete(COOKIE_NAME);
  jar.delete(USER_ID_COOKIE);

  return NextResponse.json({ ok: true });
}