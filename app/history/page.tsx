
import Historydetails from "@/components/historydetails"
import { DiseaseData } from "@/lib/types"



 export async function getDiseases() {
  const res = await fetch(`${process.env.API_URL}/diseases`)
  
   if (!res.ok) throw new Error('Failed to fetch diseases');
  return res.json();
}

export default async function Page() {
    const allScans: DiseaseData[] = await getDiseases()
  return(
    <Historydetails allScans={allScans}/>
  )
}