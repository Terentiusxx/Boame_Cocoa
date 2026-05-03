/**
 * app/api/experts/my-consultations/route.ts
 * GET /api/experts/my-consultations → backend GET /experts/consultations/my
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPERT_COOKIE_NAME } from '@/lib/constants';

function getBackendUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
}

export async function GET() {
  const token = (await cookies()).get(EXPERT_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const res  = await fetch(`${getBackendUrl()}/experts/consultations/my`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? [], { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
