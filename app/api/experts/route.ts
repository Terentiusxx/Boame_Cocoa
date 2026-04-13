/**
 * app/api/experts/route.ts
 * GET /api/experts → backend GET /experts
 * Supports optional ?skip= and ?limit= query params for pagination.
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();

  // Forward pagination params if provided by the client
  const skip  = searchParams.get('skip');
  const limit = searchParams.get('limit');
  if (skip)  qs.set('skip', skip);
  if (limit) qs.set('limit', limit);

  const path = qs.toString() ? `/experts?${qs}` : '/experts';
  return proxyBackendJson(path);
}
