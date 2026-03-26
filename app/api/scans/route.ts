import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const USER_ID_COOKIE = 'user_id'

type WithData<T> = { data: T }
type MaybeWrapped<T> = T | WithData<T>

function unwrap<T>(value: MaybeWrapped<T>): T {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as WithData<T>).data
  }
  return value as T
}

function extractScanId(payload: unknown): number | null {
  const data = unwrap(payload as any)
  const candidate =
    (data as any)?.scan_id ??
    (data as any)?.id ??
    (data as any)?.data?.scan_id ??
    (data as any)?.data?.id

  const asNumber = typeof candidate === 'number' ? candidate : Number(String(candidate ?? ''))
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null
}

async function getUserIdFromDashboard() {
  const cookieValue = (await cookies()).get(USER_ID_COOKIE)?.value
  if (cookieValue) {
    const n = Number(String(cookieValue))
    if (Number.isFinite(n) && n > 0) return n
  }

  const dashRes = await backendFetch('/users/dashboard', { method: 'GET' })
  if (!dashRes.ok) return null
  const data = await dashRes.json().catch(() => null)
  const userId =
    data?.user_id ??
    data?.id ??
    data?.data?.user_id ??
    data?.data?.id ??
    data?.user?.user_id ??
    data?.user?.id
  return userId ? Number(userId) : null
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>

    const userId =
      (typeof payload.user_id === 'number' ? payload.user_id : undefined) ??
      (await getUserIdFromDashboard())

    if (!userId) {
      return NextResponse.json(
        { message: 'Missing user_id (dashboard did not return it)' },
        { status: 400 }
      )
    }

    const imageUrl =
      (typeof payload.image_url === 'string' && payload.image_url) ||
      (typeof payload.imageDataUrl === 'string' && payload.imageDataUrl) ||
      ''

    if (!imageUrl) {
      return NextResponse.json({ message: 'Missing image_url' }, { status: 400 })
    }

    const body: Record<string, unknown> = {
      user_id: userId,
      image_url: imageUrl,
      custom_label:
        typeof payload.custom_label === 'string' ? payload.custom_label : undefined,
      latitude: typeof payload.latitude === 'number' ? payload.latitude : undefined,
      longitude: typeof payload.longitude === 'number' ? payload.longitude : undefined,
      disease_id: typeof payload.disease_id === 'number' ? payload.disease_id : undefined,
    }

    if (typeof payload.confidence_score === 'number') {
      body.confidence_score = payload.confidence_score
    }

    const res = await backendFetch('/scans/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json().catch(() => null)

    // Best-effort: ensure newly created scans appear in history.
    if (res.ok) {
      const scanId = extractScanId(json)
      if (scanId) {
        const historyRes = await backendFetch(`/history/${userId}/${scanId}`, {
          method: 'POST',
        }).catch(() => null)

        // Retry once on transient backend failure
        if (historyRes && !historyRes.ok && historyRes.status >= 500) {
          await backendFetch(`/history/${userId}/${scanId}`, { method: 'POST' }).catch(() => null)
        }
      }
    }

    return NextResponse.json(json, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
