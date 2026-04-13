/**
 * app/api/scans/[scan_id]/route.ts
 * GET /api/scans/:scan_id → backend GET /scans/:scan_id
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET(
  _req: Request,
  context: { params: Promise<{ scan_id: string }> }
) {
  const { scan_id } = await context.params;
  return proxyBackendJson(`/scans/${scan_id}`);
}
