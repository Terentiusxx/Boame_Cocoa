/**
 * app/api/messages/route.ts
 * GET /api/messages → backend GET /messages (list threads for current user)
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET() {
  return proxyBackendJson('/messages');
}
