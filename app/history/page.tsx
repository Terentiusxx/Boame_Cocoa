'use client';

import Link from "next/link";
import DiseaseCard from "../components/DiseaseCard";

interface DiseaseData {
  id: string;
  name: string;
  urgency: 'High Urgency' | 'Medium Urgency' | 'Low Urgency' | "Wasn't able to detect issue";
  image: string;
  urgencyClass: string;
}

const allScans: DiseaseData[] = [
  {
    id: 'black-pod',
    name: 'Black Pod',
    urgency: 'High Urgency',
    image: '/img/blackpod.png',
    urgencyClass: 'urgency-high'
  },
  {
    id: 'vascular-streak',
    name: 'Vascular-Streak Dieback',
    urgency: 'Medium Urgency',
    image: '/img/vascularstreak.png',
    urgencyClass: 'urgency-medium'
  },
  {
    id: 'ccsvd',
    name: 'CCSVD',
    urgency: 'High Urgency',
    image: '/img/ccsvd.png',
    urgencyClass: 'urgency-high'
  },
  {
    id: 'unknown',
    name: 'Unknown',
    urgency: "Wasn't able to detect issue",
    image: '/img/unknown.png',
    urgencyClass: 'text-gray-500'
  }
];

function StatusBar() {
  return (
    <div className="status-bar">
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

export default function History() {
  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6">
          <Link href="/home" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-title">History</h1>
          <div className="w-9"></div> {/* Spacer for centered title */}
        </div>
        
        {/* Previous Scans Section */}
        <div>
          <h2 className="text-lg font-semibold text-subtitle mb-4">Previous Scans</h2>
          
          {allScans.map((disease, index) => (
            <DiseaseCard 
              key={index} 
              id={disease.id}
              name={disease.name}
              urgency={disease.urgency}
              image={disease.image}
              urgencyClass={disease.urgencyClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}