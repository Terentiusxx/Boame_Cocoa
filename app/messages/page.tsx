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

type Expert = {
  expert_id: number
  first_name: string
  last_name: string
  specialization?: string
  is_verified?: boolean
  rating?: number
}

export default async function Page() {
  const threads = unwrap(await serverApi<MaybeWrapped<Thread[]>>('/messages'))
  const experts = unwrap(await serverApi<MaybeWrapped<Expert[]>>('/experts'))

  const expertsById = Object.fromEntries(experts.map((e) => [e.expert_id, e])) as Record<number, Expert>

  return (
    <AuthGuard type="protected">
      <MessagesListClient threads={threads ?? []} expertsById={expertsById} />
    </AuthGuard>
  )
}
