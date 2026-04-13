/**
 * SplashClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Loading/splash screen shown on first app open.
 * Auto-redirects to login after 3 seconds, or immediately on tap.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function SplashClient() {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => router.push(ROUTES.LOGIN), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="max-w-mobile mx-auto min-h-screen relative shadow-mobile bg-gradient-to-b from-green-800 via-green-600 to-green-700 cursor-pointer overflow-hidden"
      onClick={() => router.push(ROUTES.LOGIN)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(ROUTES.LOGIN)}
      aria-label="Tap to continue"
    >
      {/* Decorative background blobs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-4 w-16 h-16 rounded-full bg-white rotate-12" />
        <div className="absolute top-32 right-8 w-10 h-10 rounded-full bg-white -rotate-12" />
        <div className="absolute bottom-32 left-8 w-12 h-12 rounded-full bg-white rotate-45" />
        <div className="absolute bottom-16 right-12 w-8 h-8 rounded-full bg-white -rotate-45" />
        <div className="absolute top-1/2 left-2 w-10 h-10 rounded-full bg-white rotate-90" />
        <div className="absolute top-1/3 right-4 w-8 h-8 rounded-full bg-white -rotate-12" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full relative z-10 text-center px-8 min-h-screen">

        {/* Logo area */}
        <div className="mb-8">
          <div className="relative inline-flex">
            <div className="absolute -top-4 -left-6 w-8 h-8 rounded-full bg-white/30 animate-pulse" />
            <div className="absolute -top-2 right-4 w-6 h-6 rounded-full bg-white/30 animate-pulse delay-300" />

            <div className="bg-white/20 rounded-full p-6 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">Boame</h1>
        <h2 className="text-4xl font-light text-white mb-8 tracking-wider">Cocoa</h2>

        <p className="text-white text-lg opacity-90 mb-12 leading-relaxed">
          AI-Powered Cocoa Disease Detection
        </p>

        {/* Loading dots */}
        <div className="flex space-x-2 mb-4">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
        </div>

        <p className="text-white text-sm opacity-70">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
