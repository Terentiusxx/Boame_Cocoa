import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const latitude = url.searchParams.get('latitude')
    const longitude = url.searchParams.get('longitude')

    const params = new URLSearchParams()
    if (latitude) params.set('latitude', latitude)
    if (longitude) params.set('longitude', longitude)

    const qs = params.toString()
    const path = `/ai/voice-diagnose${qs ? `?${qs}` : ''}`

    const formData = await req.formData()

    const res = await backendFetch(path, {
      method: 'POST',
      body: formData,
    })

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await res.json().catch(() => null)
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
