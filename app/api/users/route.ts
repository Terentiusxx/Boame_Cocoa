import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

function isMissingBodyFields422(payload: any): boolean {
  const detail = payload?.detail
  if (!Array.isArray(detail) || detail.length === 0) return false

  return detail.every((item) => {
    const loc = Array.isArray(item?.loc) ? item.loc : []
    return item?.type === 'missing' && loc[0] === 'body'
  })
}

async function toNextJson(res: Response) {
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? { message: 'Invalid JSON from backend' }, { status: res.status })
  }

  const text = await res.text().catch(() => '')
  return NextResponse.json(
    text ? { message: text } : { message: res.ok ? 'OK' : 'Request failed' },
    { status: res.status }
  )
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || 'application/json'
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const form = new URLSearchParams()

      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          form.set(key, value)
        }
      }

      const multipartRes = await backendFetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
      return toNextJson(multipartRes)
    }

    const rawBody = await req.text().catch(() => '')

    const firstRes = await backendFetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body: rawBody || undefined,
    })

    const firstPayload = await firstRes.clone().json().catch(() => null)

    // Some backends define signup fields as Form() instead of JSON body.
    // If JSON was rejected as "all required body fields missing", retry as form-urlencoded.
    if (firstRes.status === 422 && isMissingBodyFields422(firstPayload)) {
      const asJson = JSON.parse(rawBody || '{}') as Record<string, unknown>
      const form = new URLSearchParams()

      for (const [key, value] of Object.entries(asJson)) {
        if (value === undefined || value === null) continue
        if (typeof value === 'object') continue
        form.set(key, String(value))
      }

      const retryRes = await backendFetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })

      return toNextJson(retryRes)
    }

    return toNextJson(firstRes)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Proxy failed' },
      { status: 500 }
    )
  }
}
