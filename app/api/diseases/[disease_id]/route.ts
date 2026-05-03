/**
 * app/api/diseases/[disease_id]/route.ts
 * GET /api/diseases/:id → backend GET /diseases/:id
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET(
  _req: Request,
  context: { params: Promise<{ disease_id: string }> }
) {
  const { disease_id } = await context.params;
  return proxyBackendJson(`/diseases/${disease_id}`);
}
