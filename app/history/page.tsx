
import Historydetails from "@/components/historydetails"
import { HistoryResponse } from "@/lib/types";
import { serverApi } from '@/lib/serverAPI'

export const dynamic = 'force-dynamic'

type WithData<T> = { data: T }
type MaybeWrapped<T> = T | WithData<T>

function unwrap<T>(value: MaybeWrapped<T>): T {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as WithData<T>).data
  }
  return value as T
}

async function getUserId() {
  const dash = await serverApi<any>('/users/dashboard')
  return (
    dash?.user_id ??
    dash?.id ??
    dash?.data?.user_id ??
    dash?.data?.id ??
    dash?.user?.user_id ??
    dash?.user?.id ??
    null
  )
}

export default async function Page() {
  const userId = await getUserId()
  if (!userId) return <Historydetails allScans={[]} />

  const data = unwrap(
    await serverApi<MaybeWrapped<HistoryResponse>>(`/history/${userId}?limit=50`)
  )
  return <Historydetails allScans={data.scans ?? []} />
}