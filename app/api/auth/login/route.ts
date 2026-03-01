import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const COOKIE_NAME = 'auth_token'

export async function POST(req: Request) {
  try {
    if (!API_URL) {
      return NextResponse.json({ message: 'Missing API url' }, { status: 500 })
    }

    const { email, password } = await req.json()

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { message: text || 'Invalid credentials' },
        { status: res.status }
      )
    }

    const data = await res.json()

    const token =
      data?.access_token || data?.token || data?.jwt || data?.accessToken

    if (!token) {
      return NextResponse.json(
        { message: 'Login response did not include a token' },
        { status: 500 }
      )
    }

    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'Login failed' }, { status: 500 })
  }
}