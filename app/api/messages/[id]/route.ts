/**
 * app/api/messages/[id]/route.ts
 * GET  /api/messages/:id → backend GET /messages/messages/consultation/{consult_id}
 * POST /api/messages/:id → backend POST /messages/messages/ (send message)
 */
import { proxyBackendJson } from '@/lib/backendProxy';
import { cookies } from 'next/headers';
import { COOKIE_NAME, EXPERT_COOKIE_NAME } from '@/lib/constants';

function toBearerHeader(token: string) {
  return /^bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Allow the client to specify which role should be used when both sessions exist.
  const url = new URL(req.url);
  const as = url.searchParams.get('as');

  const jar = await cookies();
  const userToken = jar.get(COOKIE_NAME)?.value;
  const expertToken = jar.get(EXPERT_COOKIE_NAME)?.value;
  const token = as === 'expert'
    ? expertToken
    : as === 'user'
    ? userToken
    : (userToken ?? expertToken);

  const init: RequestInit | undefined = token ? { headers: { Authorization: toBearerHeader(token) } } : undefined;

  // Correct backend path: GET /messages/messages/consultation/{consult_id}
  const primary = await proxyBackendJson(`/messages/messages/consultation/${id}`, init);
  if (primary.status !== 404 && primary.status !== 405) return primary;

  // Fallback for older backend versions
  return proxyBackendJson(`/messages/messages/consultation/${id}`, init);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const body = await req.json().catch(() => ({}));
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };

  // Correct backend path: POST /messages/messages/
  // The consultation_id must be included in the body
  const base = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {};
  return proxyBackendJson('/messages/messages/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...base, consultation_id: Number(id) }),
  });
}
