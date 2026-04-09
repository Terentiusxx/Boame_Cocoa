import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'auth_token'
const USER_ID_COOKIE = 'user_id'

export async function GET() {
  const cookieStore = await cookies()
  const hasSession = Boolean(
    cookieStore.get(COOKIE_NAME)?.value || cookieStore.get(USER_ID_COOKIE)?.value
  )

  if (!hasSession) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}