import { proxyBackendJson } from '@/lib/backendProxy'

export async function GET(req: Request) {
  return proxyBackendJson(req, '/users/dashboard', { method: 'GET' })
}
