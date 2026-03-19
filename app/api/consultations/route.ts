import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>

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

    const scanId = typeof payload.scan_id === 'number' ? payload.scan_id : Number(payload.scan_id)

    if (!userId || !scanId) {
      return NextResponse.json({ message: 'Missing user_id or scan_id' }, { status: 400 })
    }

    const body = {
      user_id: Number(userId),
      scan_id: scanId,
      expert_id: typeof payload.expert_id === 'number' ? payload.expert_id : undefined,
      subject: typeof payload.subject === 'string' ? payload.subject : 'Expert help request',
      description: typeof payload.description === 'string' ? payload.description : '',
      priority: typeof payload.priority === 'string' ? payload.priority : 'Medium',
    }

    const res = await backendFetch('/consultations/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
