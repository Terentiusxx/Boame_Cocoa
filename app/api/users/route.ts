import { proxyBackendJson } from '@/lib/backendProxy'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  return proxyBackendJson(req, '/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
}
