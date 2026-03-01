import Link from "next/link";
import DiseaseCard from "@/components/DiseaseCard";
import CheckCocoaCard from "@/components/CheckCocoaCard";
import BottomNavigation from "@/components/layout/navbar";
import { DiseaseData } from "@/lib/types"


export default function Home({ recentScans }: { recentScans: DiseaseData[] }) {
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-24 pt-8">
        {/* Greeting */}
        <h1 className="text-3xl font-bold text-brand-text-titles mb-6">
          Hey User,
        </h1>
        
        {/* Check Your Cocoa Card */}
        <CheckCocoaCard />
        
        {/* Previous Scans Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-brand-text-titles mb-4">
            Previous Scans
          </h2>
          
          {recentScans.map((disease, index) => (
            <DiseaseCard 
              key={index} 
              id={disease.id}
              name={disease.name}
              urgency={disease.urgency}
              image={disease.image}
              urgencyClass={disease.urgencyClass}
            />
          ))}
          
          <Link href="/history" className="block text-center mt-4">
            <span className="text-brand-hyperlink underline cursor-pointer hover:opacity-80 font-semibold">
              View All
            </span>
          </Link>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}