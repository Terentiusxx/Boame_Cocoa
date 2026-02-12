'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function Processing() {
  const router = useRouter();

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      // Randomly redirect to a result
      const results = ['black-pod', 'vascular-streak', 'ccsvd', 'unknown'];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      router.push(`/results/${randomResult}`);
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Loading Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Processing Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Analyzing Image...
        </h2>
        
        <p className="text-gray-600 leading-relaxed max-w-xs">
          Our AI is examining your cocoa plant to identify any diseases or issues.
        </p>
        
        {/* Progress Steps */}
        <div className="mt-8 space-y-3 text-sm">
          <div className="flex items-center text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            Image captured successfully
          </div>
          
          <div className="flex items-center text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            Processing with AI model
          </div>
          
          <div className="flex items-center text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 animate-pulse"></div>
            Generating diagnosis...
          </div>
        </div>
      </div>
    </div>
  );
}