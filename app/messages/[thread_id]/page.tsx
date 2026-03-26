import AuthGuard from '@/components/AuthGuard'
import MessageThreadClient from '@/components/pages/MessageThreadClient'
import { serverApi } from '@/lib/serverAPI'

export const dynamic = 'force-dynamic'

type WithData<T> = { data: T }
type MaybeWrapped<T> = T | WithData<T>

function unwrap<T>(value: MaybeWrapped<T>): T {
  if (value && typeof value === 'object' && 'data' in value) return (value as any).data as T
  return value as T
}

type Expert = {
  expert_id: number
  first_name: string
  last_name: string
  specialization?: string
  rating?: number
  is_verified?: boolean
}

type ThreadResponse = {
  thread: { thread_id: number; expert_id: number }
  messages: Array<{ message_id: number; sender: 'user' | 'expert'; content: string; created_at: string }>
}

export default async function Page({
  params,
}: {
  params: Promise<{ thread_id: string }> | { thread_id: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const threadId = Number(resolvedParams.thread_id)

  if (!Number.isFinite(threadId) || threadId <= 0) {
    return (
      <AuthGuard type="protected">
        <MessageThreadClient
          threadId={0}
          expert={{ expert_id: 0, first_name: 'Expert', last_name: '' }}
          initialMessages={[]}
        />
      </AuthGuard>
    )
  }

  const threadPayload = unwrap(await serverApi<MaybeWrapped<ThreadResponse>>(`/messages/${threadId}`))
  const expert = unwrap(await serverApi<MaybeWrapped<Expert>>(`/experts/${threadPayload.thread.expert_id}`))

  return (
    <AuthGuard type="protected">
      <MessageThreadClient threadId={threadId} expert={expert} initialMessages={threadPayload.messages ?? []} />
    </AuthGuard>
  )
}
