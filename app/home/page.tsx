import Link from "next/link";
import DiseaseCard from "../components/DiseaseCard";

interface DiseaseCard {
  id: string;
  name: string;
  urgency: 'High Urgency' | 'Medium Urgency' | 'Low Urgency';
  image: string;
  urgencyClass: string;
}

const recentScans: DiseaseCard[] = [
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

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border-t border-gray-200 px-6 py-3 max-w-[375px] w-full">
      <div className="flex items-center justify-around relative">
        {/* Home */}
        <Link href="/home" className="flex flex-col items-center gap-1 p-2">
          <span className="text-xl">🏠</span>
        </Link>
        
        {/* History */}
        <Link href="/history" className="flex flex-col items-center gap-1 p-2">
          <span className="text-xl">📋</span>
        </Link>
        
        {/* Scan - Center prominent button */}
        <Link href="/scan" className="relative">
          <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">📷</span>
          </div>
        </Link>
        
        {/* Learn */}
        <Link href="/learn" className="flex flex-col items-center gap-1 p-2">
          <span className="text-xl">📚</span>
        </Link>
        
        {/* Settings */}
        <Link href="/settings" className="flex flex-col items-center gap-1 p-2">
          <span className="text-xl">⚙️</span>
        </Link>
      </div>
    </div>
  );
}



export default function Home() {
  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="px-6 pb-24"> {/* Added bottom padding for navigation */}
        {/* Greeting Section */}
        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-title mb-8">
            Hey User,
          </h1>
          
          {/* Check Your Cocoa Section */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              {/* Leaf Icon with Border - Left positioned */}
              <div className="w-20 h-20 border-4 border-gray-300 rounded-2xl flex items-center justify-center flex-shrink-0 mt-2">
                <span className="text-3xl">🌿</span>
              </div>
              
              {/* Text Content */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-subtitle mb-3">
                  Check your Cocoa
                </h2>
                <p className="text-sub-style leading-relaxed">
                  Take photos, start diagnose<br />
                  diseases & get plant care tips
                </p>
              </div>
            </div>
            
            {/* Scan Now Button - Centered */}
            <div className="text-center">
              <Link href="/scan" className="green-button inline-block w-48">
                Scan now
              </Link>
            </div>
          </div>
        </div>
        
        {/* Previous Scans Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-title">Previous Scans</h2>
          </div>
          
        <div>
          <h2 className="text-lg font-semibold text-subtitle mb-4">Previous Scans</h2>
          
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
        </div>
          <Link href="/history" className="block text-center mt-4">
            <span className="text-hyperlink font-semibold">View All</span>
          </Link>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}