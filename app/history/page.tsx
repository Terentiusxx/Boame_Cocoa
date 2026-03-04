
import Historydetails from "@/components/historydetails"
import { HistoryResponse } from "@/lib/types";
import { serverApi } from '@/lib/serverAPI'

export default async function Page({ params }: { params: { user_id: string } }) {
  const data = await serverApi<HistoryResponse>(`/history/${params.user_id}`)
  return <Historydetails allScans={data.scans} />
}