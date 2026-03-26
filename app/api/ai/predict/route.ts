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
    const url = new URL(req.url)
    const latitude = url.searchParams.get('latitude')
    const longitude = url.searchParams.get('longitude')

    const params = new URLSearchParams()
    if (latitude) params.set('latitude', latitude)
    if (longitude) params.set('longitude', longitude)

    const qs = params.toString()
    const path = `/ai/predict${qs ? `?${qs}` : ''}`

    const formData = await req.formData()

    const res = await backendFetch(path, {
      method: 'POST',
      body: formData,
    })

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await res.json().catch(() => null)

      // Best-effort: save scan to history when prediction returns a scan id.
      if (res.ok) {
        const scanId = extractScanId(json)
        if (scanId) {
          const userId = await getUserIdFromDashboard()
          if (userId) {
            const historyRes = await backendFetch(`/history/${userId}/${scanId}`, {
              method: 'POST',
            }).catch(() => null)

            // Retry once on transient backend failure
            if (historyRes && !historyRes.ok && historyRes.status >= 500) {
              await backendFetch(`/history/${userId}/${scanId}`, { method: 'POST' }).catch(
                () => null
              )
            }
          }
        }
      }

      return NextResponse.json(json ?? { message: 'Invalid JSON from backend' }, {
        status: res.status,
      })
    }

    const text = await res.text().catch(() => '')
    return NextResponse.json(
      text ? { message: text } : { message: res.ok ? 'OK' : 'Request failed' },
      { status: res.status }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
