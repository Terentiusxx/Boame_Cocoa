import { backendFetch } from '@/lib/backendProxy'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const params = url.searchParams

  const skip = params.get('skip')
  const limit = params.get('limit')

  const qs = new URLSearchParams()
  if (skip) qs.set('skip', skip)
  if (limit) qs.set('limit', limit)

  const res = await backendFetch(`/diseases/${qs.toString() ? `?${qs}` : ''}`, {
    method: 'GET',
  })

  const json = await res.json().catch(() => null)
  return NextResponse.json(json, { status: res.status })
}
