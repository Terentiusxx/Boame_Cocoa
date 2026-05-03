/**
 * app/messages/[thread_id]/page.tsx
 * Server Component — fetches existing thread messages server-side,
 * passes them as initialMessages to MessageThreadClient.
 */
import AuthGuard from '@/components/AuthGuard';
import MessageThreadClient from '@/components/pages/MessageThreadClient';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Message = {
  message_id: number;
  sender: 'user' | 'expert';
  content: string;
  created_at: string;
};

async function getMessages(threadId: string): Promise<Message[]> {
  try {
    const payload = await serverApi<{ messages?: Message[] } | Message[]>(`/messages/${threadId}`);
    const data = unwrapData<{ messages?: Message[] }>(payload as { data?: { messages?: Message[] } }) ??
      (payload as { messages?: Message[] });

    // Response may be { messages: [...] } or directly an array
    const list = Array.isArray((data as { messages?: Message[] })?.messages)
      ? (data as { messages: Message[] }).messages
      : Array.isArray(data)
      ? (data as Message[])
      : [];

    return list;
  } catch {
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ thread_id: string }>;
}) {
  const { thread_id } = await params;
  const initialMessages = await getMessages(thread_id);

  return (
    <AuthGuard type="protected">
      <MessageThreadClient threadId={thread_id} initialMessages={initialMessages} />
    </AuthGuard>
  );
}
