/**
 * app/messages/[thread_id]/page.tsx
 * Server Component — fetches existing thread messages server-side,
 * passes them as initialMessages to MessageThreadClient.
 */
import { cookies } from 'next/headers';
import MessagesAuthGuard from '@/components/MessagesAuthGuard';
import MessageThreadClient from '@/components/pages/MessageThreadClient';
import { serverApi } from '@/lib/serverAPI';
import { normalizeThreadMessages, type ChatMessage, type ChatRole } from '@/lib/messages';
import { COOKIE_NAME, EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, USER_ID_COOKIE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type Viewer = { role: ChatRole; id?: number; token?: string };

function toBearerHeader(token: string): string {
  return /^bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

async function getViewer(prefer?: ChatRole): Promise<Viewer> {
  const jar = await cookies();
  const userToken = jar.get(COOKIE_NAME)?.value;
  const expertToken = jar.get(EXPERT_COOKIE_NAME)?.value;

  const userId = Number(jar.get(USER_ID_COOKIE)?.value);
  const expertId = Number(jar.get(EXPERT_ID_COOKIE)?.value);

  const hasUser = Boolean(userToken) || (Number.isFinite(userId) && userId > 0);
  const hasExpert = Boolean(expertToken) || (Number.isFinite(expertId) && expertId > 0);

  if (prefer === 'expert' && hasExpert) {
    return {
      role: 'expert',
      id: Number.isFinite(expertId) && expertId > 0 ? expertId : undefined,
      token: expertToken,
    };
  }
  if (prefer === 'user' && hasUser) {
    return {
      role: 'user',
      id: Number.isFinite(userId) && userId > 0 ? userId : undefined,
      token: userToken,
    };
  }

  if (hasUser) {
    return {
      role: 'user',
      id: Number.isFinite(userId) && userId > 0 ? userId : undefined,
      token: userToken,
    };
  }
  if (hasExpert) {
    return {
      role: 'expert',
      id: Number.isFinite(expertId) && expertId > 0 ? expertId : undefined,
      token: expertToken,
    };
  }
  return { role: 'user' };
}

async function getMessages(threadId: string, viewerToken?: string): Promise<ChatMessage[]> {
  const init: RequestInit | undefined = viewerToken
    ? { headers: { Authorization: toBearerHeader(viewerToken) } }
    : undefined;

  // Try the most common endpoint first; fall back to consultation-scoped messages.
  try {
    const payload = await serverApi<unknown>(`/messages/${threadId}`, init);
    const list = normalizeThreadMessages(payload);
    if (list.length > 0) return list;
  } catch {
    // fall through
  }

  try {
    const payload = await serverApi<unknown>(`/messages/consultation/${threadId}`, init);
    return normalizeThreadMessages(payload);
  } catch {
    return [];
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ thread_id: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { thread_id } = await params;
  const { as } = await searchParams;
  const prefer = as === 'expert' ? 'expert' : as === 'user' ? 'user' : undefined;
  const viewer = await getViewer(prefer);
  const initialMessages = await getMessages(thread_id, viewer.token);

  return (
    <MessagesAuthGuard>
      <MessageThreadClient
        threadId={thread_id}
        initialMessages={initialMessages}
        viewerRole={viewer.role}
        viewerId={viewer.id}
      />
    </MessagesAuthGuard>
  );
}
