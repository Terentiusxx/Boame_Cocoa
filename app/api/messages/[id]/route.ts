/**
 * app/api/messages/[id]/route.ts
 * GET  /api/messages/:id → backend GET /messages/:id (thread with messages)
 * POST /api/messages/:id → backend POST /messages/:id (send a message)
 */
import { proxyBackendJson } from '@/lib/backendProxy';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyBackendJson(`/messages/${id}`);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  return proxyBackendJson(`/messages/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
