'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
      className="max-w-mobile mx-auto min-h-screen relative shadow-mobile cursor-pointer overflow-hidden"
      onClick={() => router.push(ROUTES.LOGIN)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(ROUTES.LOGIN)}
      aria-label="Tap to continue"
    >
      {/* Full-bleed background image */}
      <Image
        src="/img/backdrop.png"
        alt="Cocoa backdrop"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Subtle dark overlay to improve text legibility */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main content — centred vertically */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center">

        {/* Logo */}
        <div className="relative w-44 h-44 mb-4">
          <Image
            src="/img/homelogo.png"
            alt="Boame Cocoa logo"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* Brand name */}
        <h1
          className="text-white font-bold leading-tight drop-shadow-lg"
          style={{ fontSize: '2.75rem' }}
        >
          Boame
        </h1>
        <h2
          className="text-white font-bold leading-tight drop-shadow-lg"
          style={{ fontSize: '2.75rem' }}
        >
          Cocoa
        </h2>
      </div>
    </div>
  );
}
