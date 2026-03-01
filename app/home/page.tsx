
import HomeUI from "@/components/homeui" 
import { DiseaseData } from "@/lib/types"



 export async function getScans() {
  const res = await fetch(`${process.env.API_URL}/scans`)
  
   if (!res.ok) throw new Error('Failed to fetch diseases');
  return res.json();
}

export default async function Page() {
    const recentScans: DiseaseData[] = await getScans()
  return(
    <HomeUI recentScans={recentScans}/>
  )
}