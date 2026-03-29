import AuthGuard from '@/components/AuthGuard'
import MessagesListClient from '@/components/pages/MessagesListClient'
import { serverApi } from '@/lib/serverAPI'

export const dynamic = 'force-dynamic'

type WithData<T> = { data: T }
type MaybeWrapped<T> = T | WithData<T>

function unwrap<T>(value: MaybeWrapped<T>): T {
  if (value && typeof value === 'object' && 'data' in value) return (value as any).data as T
  return value as T
}

type Thread = {
  thread_id: number
  expert_id: number
  user_id: number
  last_message: string
  updated_at: string
  unread_count: number
}

type Consultation = {
  consultation_id: number
  expert_id?: number
  user_id?: number
  status?: string
  recommendation?: string
  created_at?: string
}

type BackendMessage = {
  message_id: number
  consultation_id?: number
  content: string
  sender_id?: number
  created_at: string
}

type Expert = {
  expert_id: number
  first_name: string
  last_name: string
  specialization?: string
  is_verified?: boolean
  rating?: number
}

export default async function Page() {
  async function safeApi<T>(path: string, init?: RequestInit): Promise<T | null> {
    try {
      return unwrap(await serverApi<MaybeWrapped<T>>(path, init))
    } catch {
      return null
    }
  }

  const consultations = (await safeApi<Consultation[]>('/consultations')) ?? []
  const experts = (await safeApi<Expert[]>('/experts')) ?? []

  const threads: Thread[] = await Promise.all(
    consultations.map(async (c) => {
      const consultId = Number(c.consultation_id)
      const userId = Number(c.user_id ?? 0)
      const expertId = Number(c.expert_id ?? 0)

      let lastMessage = (typeof c.recommendation === 'string' ? c.recommendation : '').trim()
      let updatedAt = typeof c.created_at === 'string' ? c.created_at : new Date().toISOString()
      let unreadCount = 0

      const msgs = await safeApi<BackendMessage[]>(`/messages/consultation/${consultId}`)
      if (msgs && msgs.length) {
        const last = msgs[msgs.length - 1]
        lastMessage = (last?.content || lastMessage || '').toString()
        updatedAt = (last?.created_at || updatedAt).toString()
      }

      const unreadPayload = await safeApi<any>(`/messages/consultation/${consultId}/unread-count`)
      const candidateUnread =
        unreadPayload?.unread_count ??
        unreadPayload?.count ??
        unreadPayload?.data?.unread_count ??
        unreadPayload?.data?.count
      if (Number.isFinite(Number(candidateUnread))) unreadCount = Number(candidateUnread)

      return {
        thread_id: consultId,
        expert_id: expertId,
        user_id: userId,
        last_message: lastMessage || 'No messages yet.',
        updated_at: updatedAt,
        unread_count: unreadCount,
      }
    })
  )

  const expertsById = Object.fromEntries(experts.map((e) => [e.expert_id, e])) as Record<number, Expert>

  return (
    <AuthGuard type="protected">
      <MessagesListClient threads={threads ?? []} expertsById={expertsById} />
    </AuthGuard>
  )
}
