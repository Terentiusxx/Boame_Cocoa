import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'auth_token'

export async function POST() {
  (await cookies()).delete(COOKIE_NAME)
  return NextResponse.json({ ok: true })
}