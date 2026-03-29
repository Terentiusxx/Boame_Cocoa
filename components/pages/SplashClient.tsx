'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashClient() {
  const router = useRouter();

  useEffect(() => {
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
       

      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-4 w-16 h-16 rounded-full bg-white rotate-12"></div>
          <div className="absolute top-32 right-8 w-10 h-10 rounded-full bg-white -rotate-12"></div>
          <div className="absolute bottom-32 left-8 w-12 h-12 rounded-full bg-white rotate-45"></div>
          <div className="absolute bottom-16 right-12 w-8 h-8 rounded-full bg-white -rotate-45"></div>
          <div className="absolute top-1/2 left-2 w-10 h-10 rounded-full bg-white rotate-90"></div>
          <div className="absolute top-1/3 right-4 w-8 h-8 rounded-full bg-white -rotate-12"></div>
        </div>

        <div className="z-10 text-center px-8">
          <div className="relative mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="relative">
                <div className="absolute -top-4 -left-6 w-8 h-8 rounded-full bg-white/30 animate-pulse"></div>
                <div className="absolute -top-2 right-4 w-6 h-6 rounded-full bg-white/30 animate-pulse delay-300"></div>

                <div className="bg-white bg-opacity-20 rounded-full p-6 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </div>

                <div className="absolute -bottom-2 -right-4 text-white text-2xl opacity-60">·</div>
                <div className="absolute -bottom-4 left-2 text-white text-xl opacity-40 rotate-180">·</div>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">Boame</h1>
          <h2 className="text-4xl font-light text-white mb-8 tracking-wider">Cocoa</h2>

          <p className="text-white text-lg opacity-90 mb-12 leading-relaxed">
            AI-Powered Cocoa Disease Detection
          </p>

          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>

          <p className="text-white text-sm opacity-70 mt-4">Tap anywhere to continue</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
