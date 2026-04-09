import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isDev, getMockResponse } from '@/lib/devMode'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const COOKIE_NAME = 'auth_token'
const USER_ID_COOKIE = 'user_id'

function requireApiUrl() {
  if (!API_URL) throw new Error('Missing API url')
  const trimmed = API_URL.trim().replace(/\/+$/, '')

  try {
    const url = new URL(trimmed)
    const isNgrok = /(^|\.)ngrok(-free)?\.app$/i.test(url.hostname)
    if (isNgrok && url.protocol === 'http:') {
      url.protocol = 'https:'
      return url.toString().replace(/\/+$/, '')
    }
  } catch {
    // ignore invalid URL; fallback to trimmed
  }

  return trimmed
}

function decodeJwtPayload(token: string): unknown {
  const parts = token.split('.')
  if (parts.length < 2) return null

  const base64Url = parts[1] ?? ''
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  try {
    const json = Buffer.from(padded, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

function extractUserId(data: any, token: string): number | null {
  const candidate =
    data?.user_id ??
    data?.id ??
    data?.user?.user_id ??
    data?.user?.id ??
    data?.data?.user_id ??
    data?.data?.id

  if (candidate !== undefined && candidate !== null) {
    const n = typeof candidate === 'number' ? candidate : Number(String(candidate))
    if (Number.isFinite(n)) return n
  }

  const payload = decodeJwtPayload(token) as any
  const fromToken = payload?.user_id ?? payload?.id ?? payload?.uid ?? payload?.sub
  if (fromToken === undefined || fromToken === null) return null

  const n = typeof fromToken === 'number' ? fromToken : Number(String(fromToken))
  return Number.isFinite(n) ? n : null
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Dev mode: use hardcoded mock data
    if (isDev()) {
      const mockResponse = getMockResponse('/auth/login', 'POST', { email, password })
      
      if (!mockResponse) {
        return NextResponse.json({ message: 'Login not supported in dev mode' }, { status: 400 })
      }
      
      if (mockResponse.error) {
        return NextResponse.json({ message: mockResponse.error }, { status: mockResponse.status })
      }

      const data = mockResponse.data
      const token = data?.token || 'dev-token-12345'
      const user = data?.user

      const cookieStore = await cookies()
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      const userId = user?.user_id || 1
      if (userId) {
        cookieStore.set(USER_ID_COOKIE, String(userId), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      return NextResponse.json({ ok: true })
    }

    // Production: use real backend
    const baseUrl = requireApiUrl()

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const json = await res.json().catch(() => null)
        const message = json?.message ?? json?.detail ?? 'Invalid credentials'
        return NextResponse.json({ message }, { status: res.status })
      }

      const text = await res.text().catch(() => '')
      return NextResponse.json({ message: text || 'Invalid credentials' }, { status: res.status })
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

    const cookieStore = await cookies()

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    const userId = extractUserId(data, token)
    if (userId) {
      cookieStore.set(USER_ID_COOKIE, String(userId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'Login failed' }, { status: 500 })
  }
}