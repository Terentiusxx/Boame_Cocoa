'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface DiseaseInfo {
  name: string;
  urgency: string;
  urgencyClass: string;
  icon: string;
  description: string;
  treatment: string;
}

const diseaseData: Record<string, DiseaseInfo> = {
  'black-pod': {
    name: 'Black Pod',
    urgency: 'High Urgency',
    urgencyClass: 'urgency-high',
    icon: '🍫',
    description: 'Black pod disease is caused by Phytophthora megakarya and is one of the most devastating diseases of cocoa.',
    treatment: 'Remove infected pods immediately. Apply copper-based fungicides. Improve farm drainage and reduce humidity.'
  },
  'vascular-streak': {
    name: 'Vascular-Streak Dieback',
    urgency: 'Medium Urgency',
    urgencyClass: 'urgency-medium',
    icon: '🍃',
    description: 'Vascular-streak dieback is caused by Oncobasidium theobromae, affecting the vascular system of cocoa trees.',
    treatment: 'Prune affected branches. Improve air circulation. Use resistant varieties when replanting.'
  },
  'ccsvd': {
    name: 'CCSVD',
    urgency: 'High Urgency',
    urgencyClass: 'urgency-high',
    icon: '🌱',
    description: 'Cocoa Swollen Shoot Virus Disease (CCSVD) is a viral disease transmitted by mealybugs.',
    treatment: 'Remove infected trees immediately. Control mealybug populations. Plant virus-free seedlings.'
  }
};

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

export default function Results() {
  const params = useParams();
  const diseaseId = params.id as string;

  // If it's unknown, redirect to the unknown page
  if (diseaseId === 'unknown') {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
        <StatusBar />
        
        <div className="px-6 pb-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between py-4 mb-6">
            <Link href="/scan" className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5">
              <span className="text-xl">‹</span>
            </Link>
            <h1 className="text-xl font-semibold text-brand-text-titles">Results</h1>
            <button className="text-xl">✕</button>
          </div>
          
          {/* Unknown Result Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6">
              <div className="text-white text-4xl">↻</div>
            </div>
            
            <h2 className="text-3xl font-bold text-brand-text-titles mb-4">Unknown</h2>
            
            <p className="text-brand-sub-text font-normal leading-relaxed mb-8 max-w-xs">
              We cannot identify the disease your cocoa has. Please try again from a different angle.
            </p>
            
            <div className="w-full max-w-sm space-y-4">
              <Link href="/scan" className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 block">
                Try Again
              </Link>
              
              <Link href="/contact" className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 block bg-green-700">
                Contact Expert
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const disease = diseaseData[diseaseId];

  if (!disease) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
        <StatusBar />
        <div className="px-6 py-4">
          <p>Disease not found</p>
          <Link href="/home" className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 mt-4">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />
      
      <div className="px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6">
          <Link href="/scan" className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Results</h1>
          <button className="text-xl">✕</button>
        </div>
        
        {/* Disease Result */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{disease.icon}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-brand-text-titles mb-2">{disease.name}</h2>
          <p className={`${disease.urgencyClass} text-lg font-semibold mb-4`}>{disease.urgency}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-brand-sub-titles mb-2">Description:</h3>
            <p className="text-brand-sub-text font-normal text-sm leading-relaxed mb-4">{disease.description}</p>
            
            <h3 className="font-semibold text-brand-sub-titles mb-2">Treatment:</h3>
            <p className="text-brand-sub-text font-normal text-sm leading-relaxed">{disease.treatment}</p>
          </div>
          
          <div className="space-y-3">
            <Link href="/scan" className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 block">
              Scan Another
            </Link>
            
            <Link href="/home" className="block w-full py-3 text-center text-brand-hyperlink underline cursor-pointer hover:opacity-80 font-semibold">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}