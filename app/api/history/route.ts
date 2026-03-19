import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = url.searchParams.get('limit') || '50'

    const dashRes = await backendFetch('/users/dashboard', { method: 'GET' })
    if (!dashRes.ok) {
      const msg = await dashRes.text().catch(() => '')
      return NextResponse.json({ message: msg || 'Unauthorized' }, { status: dashRes.status })
    }

    const dash = await dashRes.json().catch(() => null)
    const userId =
      dash?.user_id ??
      dash?.id ??
      dash?.data?.user_id ??
      dash?.data?.id ??
      dash?.user?.user_id ??
      dash?.user?.id

    if (!userId) {
      return NextResponse.json({ message: 'Dashboard did not include user_id' }, { status: 500 })
    }

    const res = await backendFetch(`/history/${userId}?limit=${encodeURIComponent(limit)}`, {
      method: 'GET',
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
