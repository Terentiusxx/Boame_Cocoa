'use client';
import Link from "next/link";
import DiseaseCard from "./DiseaseCard";
import { ScanItem } from "@/lib/types";


function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  )
}

function urgencyToClass(urgency: string) {
  const u = urgency.toLowerCase()
  if (u.includes('high')) return 'text-red-500'
  if (u.includes('medium')) return 'text-orange-500'
  if (u.includes('low')) return 'text-green-600'
  return 'text-gray-400'
}

export default function Historydetails({ allScans }: { allScans: ScanItem[] }) {
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between py-4 mb-6">
          <Link
            href="/home"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">History</h1>
          <div className="w-9"></div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-brand-sub-titles mb-4">Previous Scans</h2>

          {allScans.map((scan) => (
            <DiseaseCard
              key={scan.scan_id}
              id={String(scan.scan_id)}
              name={scan.disease_name}
              urgency={scan.urgency_level}
              image={scan.image_preview_url}
              urgencyClass={urgencyToClass(scan.urgency_level)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}