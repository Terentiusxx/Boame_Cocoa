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

type Consultation = {
  consultation_id: number
  user_id?: number
  expert_id?: number
  created_at?: string
}

type BackendMessage = {
  message_id: number
  consultation_id?: number
  content: string
  sender_id?: number
  created_at: string
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

  async function safeApi<T>(path: string, init?: RequestInit): Promise<T | null> {
    try {
      return unwrap(await serverApi<MaybeWrapped<T>>(path, init))
    } catch {
      return null
    }
  }

  const consultations = (await safeApi<Consultation[]>('/consultations')) ?? []
  const consult = consultations.find((c) => Number(c.consultation_id) === threadId)

  const expertId = Number(consult?.expert_id ?? 0)
  const userId = Number(consult?.user_id ?? 0)

  const expert =
    (expertId > 0 ? await safeApi<Expert>(`/experts/${expertId}`) : null) ??
    ({ expert_id: expertId || 0, first_name: 'Expert', last_name: '' } as Expert)

  const backendMessages = (await safeApi<BackendMessage[]>(`/messages/consultation/${threadId}`)) ?? []
  const initialMessages = backendMessages.map((m) => {
    const senderId = Number(m.sender_id ?? 0)
    const sender: 'user' | 'expert' = userId > 0 && senderId === userId ? 'user' : 'expert'
    return {
      message_id: Number(m.message_id),
      sender,
      content: String(m.content ?? ''),
      created_at: String(m.created_at ?? new Date().toISOString()),
    }
  })

  return (
    <AuthGuard type="protected">
      <MessageThreadClient threadId={threadId} expert={expert} initialMessages={initialMessages} />
    </AuthGuard>
  )
}
