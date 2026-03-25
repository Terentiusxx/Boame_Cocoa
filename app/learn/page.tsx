import Link from "next/link";
import LearnCard from "@/components/LearnCard";
import { serverApi } from "@/lib/serverAPI";

type WithData<T> = { data: T };

type DiseaseListItem = {
  disease_id: number;
  name: string;
  urgency_level?: string;
  image_url?: string;
};

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in (value as any)) {
    const data = (value as WithData<unknown>).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

async function getDiseases(): Promise<DiseaseListItem[]> {
  try {
    const payload = await serverApi<unknown>(`/diseases/?limit=50`);
    return unwrapArray<DiseaseListItem>(payload);
  } catch {
    return [];
  }
}

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      {/* <span>9:41</span> */}
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
        {/* <span className="ml-2">📶</span>
        <span>🔋</span> */}
      </div>
    </div>
  );
}

export default async function Learn() {
  const diseases = await getDiseases();

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />
      
      <div className="px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6">
          <Link href="/home" className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Learn</h1>
          <div className="w-9"></div> {/* Spacer for centered title */}
        </div>
        
        {/* Learn About Section with beautiful purple border */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
          <h2 className="text-lg font-bold text-purple-900 mb-2">Learn About Cocoa Diseases</h2>
          <p className="text-sm text-purple-700">Expand your knowledge about various cocoa diseases and how to manage them effectively.</p>
        </div>
        
        {/* Diseases Grid */}
        <div className="grid grid-cols-2 gap-4">
          {diseases.map((disease) => (
            <LearnCard
              key={disease.disease_id}
              diseaseId={disease.disease_id}
              name={disease.name}
              description={'What should you know whilst learning about this disease'}
              imageUrl={disease.image_url}
              urgencyLevel={disease.urgency_level}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
