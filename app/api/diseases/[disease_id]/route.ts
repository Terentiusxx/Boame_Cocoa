import { proxyBackendJson } from '@/lib/backendProxy'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest, context: { params: Promise<{ disease_id: string }> }) {
  const { disease_id } = await context.params
  return proxyBackendJson(req, `/diseases/${disease_id}`, { method: 'GET' })
}
