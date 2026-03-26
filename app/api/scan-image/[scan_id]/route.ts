import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'
import { isDev } from '@/lib/devMode'

export async function GET(
  req: Request,
  context: { params: Promise<{ scan_id: string }> }
) {
  try {
    const { scan_id } = await context.params

    // Fetch the scan record to get the image_url
    const scanRes = await backendFetch(`/scans/${scan_id}`, { method: 'GET' })
    if (!scanRes.ok) {
      return NextResponse.json({ message: 'Scan not found' }, { status: scanRes.status })
    }

    const scanData = await scanRes.json().catch(() => null)
    const scanRecord = scanData?.data ?? scanData

    if (!scanRecord || typeof scanRecord !== 'object') {
      return NextResponse.json({ message: 'Invalid scan response' }, { status: 500 })
    }

    const imageUrl = (scanRecord as any).image_url
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ message: 'No image_url in scan record' }, { status: 404 })
    }

    // Dev mode: if the scan points to a public image, just redirect to it.
    if (isDev() && imageUrl.startsWith('/img/')) {
      return NextResponse.redirect(new URL(imageUrl, req.url))
    }

    // Determine if image_url is absolute or relative
    let fullUrl = imageUrl
    if (!imageUrl.startsWith('http')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        return NextResponse.json({ message: 'API URL not configured' }, { status: 500 })
      }
      const origin = new URL(apiUrl).origin
      fullUrl = `${origin}${imageUrl}`
    }

    // Fetch the image from the backend
    const imageRes = await fetch(fullUrl, { method: 'GET' })
    if (!imageRes.ok) {
      return NextResponse.json(
        { message: `Failed to fetch image: ${imageRes.statusText}` },
        { status: imageRes.status }
      )
    }

    const headers = new Headers()
    const passthrough = [
      'content-type',
      'content-length',
      'cache-control',
      'etag',
      'last-modified',
    ]

    for (const key of passthrough) {
      const value = imageRes.headers.get(key)
      if (value) headers.set(key, value)
    }

    const body = await imageRes.arrayBuffer()

    return new Response(body, {
      status: imageRes.status,
      headers,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch image' },
      { status: 500 }
    )
  }
}
