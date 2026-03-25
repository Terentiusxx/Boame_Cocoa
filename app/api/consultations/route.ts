import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

type WithData<T> = { data: T }
type MaybeWrapped<T> = T | WithData<T>

function unwrap<T>(value: MaybeWrapped<T>): T {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as WithData<T>).data
  }
  return value as T
}

function urgencyToPriority(urgencyLevel?: string): 'High' | 'Medium' | 'Low' {
  const v = (urgencyLevel || '').toLowerCase()
  if (v === 'high') return 'High'
  if (v === 'low') return 'Low'
  return 'Medium'
}

async function inferPriorityFromScan(scanId: number): Promise<'High' | 'Medium' | 'Low'> {
  try {
    const scanRes = await backendFetch(`/scans/${scanId}`, { method: 'GET' })
    if (!scanRes.ok) return 'Medium'
    const scanPayload = (await scanRes.json().catch(() => null)) as any
    const scan = unwrap<any>(scanPayload)
    const diseaseId = scan?.disease_id
    const diseaseIdNum = typeof diseaseId === 'number' ? diseaseId : Number(diseaseId)
    if (!Number.isFinite(diseaseIdNum) || diseaseIdNum <= 0) return 'Medium'

    const disRes = await backendFetch(`/diseases/${diseaseIdNum}`, { method: 'GET' })
    if (!disRes.ok) return 'Medium'
    const diseasePayload = (await disRes.json().catch(() => null)) as any
    const disease = unwrap<any>(diseasePayload)
    return urgencyToPriority(disease?.urgency_level)
  } catch {
    return 'Medium'
  }
}

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

    const priority = await inferPriorityFromScan(scanId)

    const body = {
      user_id: Number(userId),
      scan_id: scanId,
      expert_id: typeof payload.expert_id === 'number' ? payload.expert_id : undefined,
      subject: typeof payload.subject === 'string' ? payload.subject : 'Expert help request',
      description: typeof payload.description === 'string' ? payload.description : '',
      priority,
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
