
import Historydetails from "@/components/historydetails"
import { DiseaseData } from "@/lib/types"
import { serverApi } from '@/lib/serverAPI'

export default async function Page() {
    const allScans = await serverApi<DiseaseData[]>('/diseases')
  return(
    <Historydetails allScans={allScans}/>
  )
}