/**
 * app/api/consultations/route.ts
 * POST /api/consultations → backend POST /consultations
 *
 * Creates a consultation request between the user and a selected expert.
 * Optionally includes a scan_id to link the consultation to a specific scan.
 * Priority is inferred from the linked scan's disease urgency when available.
 */
import { backendFetch, proxyBackendJson } from '@/lib/backendProxy';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_ID_COOKIE, COOKIE_NAME } from '@/lib/constants';
import { unwrapData } from '@/lib/utils';

/** Get the authenticated user's ID from cookie or dashboard API */
async function getUserId(): Promise<number | null> {
  // Fast path: user_id cookie set during login
  const fromCookie = (await cookies()).get(USER_ID_COOKIE)?.value;
  if (fromCookie) {
    const n = Number(fromCookie);
    if (Number.isFinite(n) && n > 0) return n;
  }

  // Slow path: fetch dashboard and extract user_id
  const res = await backendFetch('/users/dashboard', { method: 'GET' });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null) as Record<string, unknown> | null;
  const id = data?.user_id ?? data?.id ??
    (data?.data as Record<string, unknown> | undefined)?.user_id ??
    (data?.user as Record<string, unknown> | undefined)?.user_id;
  return id ? Number(id) : null;
}

/**
 * Infer priority from a scan's linked disease urgency.
 * Falls back to 'Medium' if the scan or disease cannot be fetched.
 */
async function getPriorityFromScan(scanId: number): Promise<'High' | 'Medium' | 'Low'> {
  try {
    const scanRes = await backendFetch(`/scans/${scanId}`);
    if (!scanRes.ok) return 'Medium';

    const scan = unwrapData(await scanRes.json().catch(() => null)) as Record<string, unknown> | null;
    const diseaseId = typeof scan?.disease_id === 'number' ? scan.disease_id : Number(scan?.disease_id);
    if (!Number.isFinite(diseaseId) || diseaseId <= 0) return 'Medium';

    const diseaseRes = await backendFetch(`/diseases/${diseaseId}`);
    if (!diseaseRes.ok) return 'Medium';

    const disease = unwrapData(await diseaseRes.json().catch(() => null)) as Record<string, unknown> | null;
    const urgency = (disease?.urgency_level as string | undefined)?.toLowerCase();
    if (urgency === 'high') return 'High';
    if (urgency === 'low')  return 'Low';
    return 'Medium';
  } catch {
    return 'Medium';
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}) as Record<string, unknown>) as Record<string, unknown>;

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized — could not resolve user_id' }, { status: 401 });
    }

    const rawScanId = Number(payload.scan_id);
    const scanId = Number.isFinite(rawScanId) && rawScanId > 0 ? rawScanId : undefined;

    // Infer priority from scan if available; otherwise default to Medium
    const priority = scanId ? await getPriorityFromScan(scanId) : 'Medium';

    const body = {
      user_id: userId,
      scan_id: scanId,
      expert_id: typeof payload.expert_id === 'number' ? payload.expert_id : undefined,
      subject: typeof payload.subject === 'string' ? payload.subject : 'Expert help request',
      description: typeof payload.description === 'string' ? payload.description : '',
      priority,
    };

    return proxyBackendJson('/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return proxyBackendJson('/consultations');
}
