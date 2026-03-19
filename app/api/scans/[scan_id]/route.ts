import { proxyBackendJson } from '@/lib/backendProxy'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest, context: { params: Promise<{ scan_id: string }> }) {
  const { scan_id } = await context.params
  return proxyBackendJson(req, `/scans/${scan_id}`, { method: 'GET' })
}
