/**
 * app/history/page.tsx
 * Server Component — fetches scan history for the current user
 * and passes it to Historydetails as a prop.
 */
import Historydetails from '@/components/historydetails';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';
import type { HistoryResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getUserId(): Promise<number | null> {
  try {
    const payload = await serverApi<Record<string, unknown>>('/users/dashboard');
    const data = unwrapData<Record<string, unknown>>(
      payload as { data?: Record<string, unknown> }
    ) ?? (payload as Record<string, unknown>);
    const id = data?.user_id ?? data?.id ??
      (data?.user as Record<string, unknown> | undefined)?.user_id;
    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

export default async function Page() {
  try {
    const payload = await serverApi<HistoryResponse>(`/history/me?limit=50`);
    const data = unwrapData<HistoryResponse>(payload as { data?: HistoryResponse }) ??
      (payload as HistoryResponse);
    return <Historydetails allScans={data?.scans ?? []} />;
  } catch {
    return <Historydetails allScans={[]} />;
  }
}