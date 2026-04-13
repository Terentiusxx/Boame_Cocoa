/**
 * app/api/notifications/route.ts
 * GET /api/notifications → backend GET /notifications
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET() {
  return proxyBackendJson('/notifications');
}
