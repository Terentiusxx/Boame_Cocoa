/**
 * app/messages/page.tsx
 * Server Component — fetches message threads server-side and passes
 * them as props to MessagesListClient.
 */
import { cookies } from 'next/headers';
import MessagesAuthGuard from '@/components/MessagesAuthGuard';
import MessagesListClient from '@/components/pages/MessagesListClient';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';
import { COOKIE_NAME, EXPERT_COOKIE_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type Thread = {
  thread_id: number;
  expert_id: number;
  last_message?: string;
  updated_at?: string;
  unread_count?: number;
};

async function getThreads(): Promise<Thread[]> {
  try {
    const payload = await serverApi<Thread[]>('/messages');
    const list = unwrapData<Thread[]>(payload as { data?: Thread[] }) ?? payload;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default async function MessagesPage() {
  const threads = await getThreads();
  const jar = await cookies();
  const viewerRole = jar.get(COOKIE_NAME)?.value ? 'user' : jar.get(EXPERT_COOKIE_NAME)?.value ? 'expert' : 'user';

  return (
    <MessagesAuthGuard>
      <MessagesListClient threads={threads} viewerRole={viewerRole} />
    </MessagesAuthGuard>
  );
}
