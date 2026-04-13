/**
 * app/messages/page.tsx
 * Server Component — fetches message threads server-side and passes
 * them as props to MessagesListClient.
 */
import AuthGuard from '@/components/AuthGuard';
import MessagesListClient from '@/components/pages/MessagesListClient';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';

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

  return (
    <AuthGuard type="protected">
      <MessagesListClient threads={threads} />
    </AuthGuard>
  );
}
