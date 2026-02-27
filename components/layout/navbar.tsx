'use client';

import Link from "next/link";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border-t border-gray-100 px-6 py-3 max-w-mobile w-full shadow-nav-shadow z-50">
      <div className="flex items-center justify-around relative">
        {/* Home */}
        <Link href="/home" className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all no-underline text-gray-600 hover:text-gray-800 active:bg-black/10 active:text-gray-800 active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </Link>
        
        {/* Community/Users */}
        <Link href="/history" className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all no-underline text-gray-600 hover:text-gray-800 active:bg-black/10 active:text-gray-800 active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </Link>
        
        {/* Scan - Center prominent button */}
        <Link href="/scan" className="w-14 h-14 bg-brand-buttons hover:bg-opacity-90 hover:scale-105 rounded-full flex items-center justify-center shadow-scan-button transition-transform">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </Link>
        
        {/* Notifications */}
        <Link href="/learn" className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all no-underline text-gray-600 hover:text-gray-800 active:bg-black/10 active:text-gray-800 active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </Link>
        
        {/* Profile */}
        <Link href="/settings" className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all no-underline text-gray-600 hover:text-gray-800 active:bg-black/10 active:text-gray-800 active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}