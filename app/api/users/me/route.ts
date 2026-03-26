import { backendFetch } from '@/lib/backendProxy'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'auth_token'
const USER_ID_COOKIE = 'user_id'

async function hasAuthCookie(): Promise<boolean> {
  const store = await cookies()
  return Boolean(store.get(COOKIE_NAME)?.value || store.get(USER_ID_COOKIE)?.value)
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

async function getUserIdFromToken(): Promise<number | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = decodeJwtPayload(token) as any
  const candidate = payload?.user_id ?? payload?.id ?? payload?.uid ?? payload?.sub

  if (candidate === undefined || candidate === null) return null

  const asNumber = typeof candidate === 'number' ? candidate : Number(String(candidate))
  if (!Number.isFinite(asNumber)) return null
  return asNumber
}

async function getUserIdFromCookie(): Promise<number | null> {
  const value = (await cookies()).get(USER_ID_COOKIE)?.value
  if (!value) return null
  const asNumber = Number(String(value))
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null
}

async function getUserIdFromDashboard() {
  const dashRes = await backendFetch('/users/dashboard', { method: 'GET' })
  if (!dashRes.ok) {
    const msg = await dashRes.text().catch(() => '')
    throw new Error(msg || `Dashboard failed: ${dashRes.status}`)
  }

  const data = await dashRes.json().catch(() => null)

  // dashboard schema is empty in OpenAPI; be defensive
  const userId =
    data?.user_id ??
    data?.id ??
    data?.data?.user_id ??
    data?.data?.id ??
    data?.user?.user_id ??
    data?.user?.id

  if (!userId) throw new Error('Dashboard did not include user_id')
  return Number(userId)
}

async function getUserId() {
  const fromCookie = await getUserIdFromCookie()
  if (fromCookie) return fromCookie
  const fromToken = await getUserIdFromToken()
  if (fromToken) return fromToken
  return getUserIdFromDashboard()
}

export async function GET() {
  try {
    if (!(await hasAuthCookie())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const userId = await getUserId()
    const res = await backendFetch(`/users/${userId}`, { method: 'GET' })
    const json = await res.json().catch(() => null)
    return NextResponse.json(json, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await hasAuthCookie())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const userId = await getUserId()
    const body = await req.json().catch(() => null)
    const res = await backendFetch(`/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
    const json = await res.json().catch(() => null)
    return NextResponse.json(json, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    if (!(await hasAuthCookie())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const userId = await getUserId()
    const res = await backendFetch(`/users/${userId}`, { method: 'DELETE' })

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await res.json().catch(() => null)
      return NextResponse.json(json, { status: res.status })
    }

    const text = await res.text().catch(() => '')
    return NextResponse.json(text ? { message: text } : { ok: res.ok }, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
