/**
 * app/api/auth/session/route.ts
 * GET /api/auth/session → returns { authenticated: true/false }
 *
 * Used by AuthGuard on the client to check if the user is logged in.
 * Checks for the presence of the auth token cookie — does NOT verify it.
 * Actual token verification happens implicitly on every backend request.
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAME, USER_ID_COOKIE } from '@/lib/constants';

export async function GET() {
  const jar = await cookies();
  const isAuthenticated = Boolean(
    jar.get(COOKIE_NAME)?.value || jar.get(USER_ID_COOKIE)?.value
  );

  if (!isAuthenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}