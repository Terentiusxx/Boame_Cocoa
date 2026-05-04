import { proxyBackendJson } from '@/lib/backendProxy';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Parse scan_id from request body
  let scanId: string | undefined;
  try {
    const body = await req.json() as Record<string, unknown>;
    scanId = body?.scan_id != null ? String(body.scan_id) : undefined;
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!scanId) {
    return NextResponse.json({ message: 'scan_id is required' }, { status: 400 });
  }

  // Backend endpoint: POST /history/add/{scan_id}
  return proxyBackendJson(`/history/add/${scanId}`, { method: 'POST' });
}
