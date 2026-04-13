/**
 * app/api/users/dashboard/route.ts
 * GET /api/users/dashboard → backend GET /users/dashboard
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET() {
  return proxyBackendJson('/users/dashboard');
}
