'use client';

import Link from "next/link";
import LearnCard from "../components/LearnCard";

interface DiseaseData {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
}

const diseases: DiseaseData[] = [
  {
    id: 'black-pod',
    name: 'Black Pod Disease',
    description: 'What should you know whilst learning about this disease',
    image: '/img/blackpod.png',
    color: 'red'
  },
  {
    id: 'ccvd',
    name: 'CCVD Disease',
    description: 'What should you know whilst learning about this disease',
    image: '/img/ccsvd.png',
    color: 'red'
  },
  {
    id: 'witches-broom',
    name: "Witches' Broom",
    description: 'What should you know whilst learning about this disease',
    image: '/img/blackpod.png', // Using existing image as placeholder
    color: 'orange'
  },
  {
    id: 'frosty-pod',
    name: 'Frosty Pod Rot',
    description: 'What should you know whilst learning about this disease',
    image: '/img/ccsvd.png', // Using existing image as placeholder
    color: 'orange'
  },
  {
    id: 'vsd',
    name: 'VSD Disease',
    description: 'Small black pud grows from round looking swelling',
    image: '/img/vascularstreak.png', // Using existing similar image
    color: 'orange'
  },
  {
    id: 'swollen-shoot',
    name: 'Cocoa Swollen Shoot',
    description: 'What should you know whilst learning about this disease',
    image: '/img/blackpod.png', // Using existing image as placeholder
    color: 'orange'
  },
  {
    id: 'wittering',
    name: 'Wittering Disease',
    description: 'What should you know whilst learning about this disease',
    image: '/img/unknown.png', // Using existing image as placeholder
    color: 'green'
  },
  {
    id: 'genetic-environmental',
    name: 'Genetic & Environmental',
    description: 'What should you know whilst learning about this disease',
    image: '/img/unknown.png', // Using existing image as placeholder
    color: 'green'
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

export default function Learn() {
  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6">
          <Link href="/home" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-title">Learn</h1>
          <div className="w-9"></div> {/* Spacer for centered title */}
        </div>
        
        {/* Learn About Section with beautiful purple border */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
          <h2 className="text-lg font-bold text-purple-900 mb-2">Learn About Cocoa Diseases</h2>
          <p className="text-sm text-purple-700">Expand your knowledge about various cocoa diseases and how to manage them effectively.</p>
        </div>
        
        {/* Diseases Grid */}
        <div className="grid grid-cols-2 gap-4">
          {diseases.map((disease, index) => (
            <LearnCard 
              key={index} 
              id={disease.id}
              name={disease.name}
              description={disease.description}
              image={disease.image}
              color={disease.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
