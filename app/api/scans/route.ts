import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

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

    const body = {
      user_id: userId,
      image_url: imageUrl,
      confidence_score:
        typeof payload.confidence_score === 'number' ? payload.confidence_score : 0,
      custom_label:
        typeof payload.custom_label === 'string' ? payload.custom_label : undefined,
      latitude: typeof payload.latitude === 'number' ? payload.latitude : undefined,
      longitude: typeof payload.longitude === 'number' ? payload.longitude : undefined,
      disease_id: typeof payload.disease_id === 'number' ? payload.disease_id : undefined,
    }

    const res = await backendFetch('/scans/', {
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
