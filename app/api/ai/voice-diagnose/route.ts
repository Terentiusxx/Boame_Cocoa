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
    const requestContentType = req.headers.get('content-type')
    const body = await req.arrayBuffer()

    const headers = new Headers()
    if (requestContentType) {
      headers.set('content-type', requestContentType)
    }

    const res = await backendFetch(path, {
      method: 'POST',
      headers,
      body,
    })

    const responseContentType = res.headers.get('content-type') || ''
    if (responseContentType.includes('application/json')) {
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
