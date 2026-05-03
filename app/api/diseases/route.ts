/**
 * app/api/diseases/route.ts
 * GET /api/diseases → backend GET /diseases
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();

  const skip  = searchParams.get('skip');
  const limit = searchParams.get('limit');
  if (skip)  qs.set('skip', skip);
  if (limit) qs.set('limit', limit);

  const path = qs.toString() ? `/diseases?${qs}` : '/diseases';
  return proxyBackendJson(path);
}
