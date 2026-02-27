'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10 text-white">
      {/* <span>9:41</span> */}
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-white rounded-sm"></div>
          <div className="w-1 h-3 bg-white rounded-sm"></div>
          <div className="w-1 h-3 bg-white rounded-sm"></div>
          <div className="w-1 h-3 bg-white opacity-50 rounded-sm"></div>
        </div>
        {/* <span className="ml-2">📶</span>
        <span>🔋</span> */}
      </div>
    </div>
  );
}

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate to login after 3 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleTap = () => {
    router.push('/login');
  };

  return (
    <div 
      className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile bg-gradient-to-b from-green-800 via-green-600 to-green-700 cursor-pointer" 
      onClick={handleTap}
    >
      <StatusBar />
      
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-4 text-6xl rotate-12">🌿</div>
          <div className="absolute top-32 right-8 text-4xl -rotate-12">🍃</div>
          <div className="absolute bottom-32 left-8 text-5xl rotate-45">🌱</div>
          <div className="absolute bottom-16 right-12 text-3xl -rotate-45">🍃</div>
          <div className="absolute top-1/2 left-2 text-4xl rotate-90">🌿</div>
          <div className="absolute top-1/3 right-4 text-3xl -rotate-12">🌱</div>
        </div>

        {/* Main content */}
        <div className="z-10 text-center px-8">
          {/* Logo area with cocoa pods */}
          <div className="relative mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="relative">
                {/* Cocoa pods */}
                <div className="absolute -top-4 -left-6 text-4xl animate-pulse">🍫</div>
                <div className="absolute -top-2 right-4 text-3xl animate-pulse delay-300">🟤</div>
                
                {/* Main leaf icon */}
                <div className="bg-white bg-opacity-20 rounded-full p-6 backdrop-blur-sm">
                  <div className="text-6xl">🌿</div>
                </div>
                
                {/* Decorative swirls */}
                <div className="absolute -bottom-2 -right-4 text-white text-2xl opacity-60">〰️</div>
                <div className="absolute -bottom-4 left-2 text-white text-xl opacity-40 rotate-180">〰️</div>
              </div>
            </div>
          </div>

          {/* App name */}
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">
            Boame
          </h1>
          <h2 className="text-4xl font-light text-white mb-8 tracking-wider">
            Cocoa
          </h2>

          {/* Tagline */}
          <p className="text-white text-lg opacity-90 mb-12 leading-relaxed">
            AI-Powered Cocoa Disease Detection
          </p>

          {/* Loading indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>

          <p className="text-white text-sm opacity-70 mt-4">
            Tap anywhere to continue
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}