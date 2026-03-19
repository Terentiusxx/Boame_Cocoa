import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

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

export async function GET() {
  try {
    const userId = await getUserIdFromDashboard()
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
    const userId = await getUserIdFromDashboard()
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
