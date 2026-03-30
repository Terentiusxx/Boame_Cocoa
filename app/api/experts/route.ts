import { proxyBackendJson } from '@/lib/backendProxy'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const params = url.searchParams

  const skip = params.get('skip')
  const limit = params.get('limit')

  const qs = new URLSearchParams()
  if (skip) qs.set('skip', skip)
  if (limit) qs.set('limit', limit)

  return proxyBackendJson(req, `/experts${qs.toString() ? `?${qs}` : ''}`, { method: 'GET' })
}
