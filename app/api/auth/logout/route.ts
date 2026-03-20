import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'auth_token'
const USER_ID_COOKIE = 'user_id'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  cookieStore.delete(USER_ID_COOKIE)
  return NextResponse.json({ ok: true })
}