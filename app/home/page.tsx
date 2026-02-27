
import HomeUI from "@/components/homeui" 
import { DiseaseData } from "@/lib/types"



 export async function getDiseases() {
  const res = await fetch(`${process.env.API_URL}/diseases`)
  
   if (!res.ok) throw new Error('Failed to fetch diseases');
  return res.json();
}

export default async function Page() {
    const recentScans: DiseaseData[] = await getDiseases()
  return(
    <HomeUI recentScans={recentScans}/>
  )
}