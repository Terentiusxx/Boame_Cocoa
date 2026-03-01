'use client';

import Link from "next/link";
import Image from "next/image";

export default function CheckCocoaCard() {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
      <div className="flex items-start gap-4 mb-6">
        {/* Leaf Icon with Border */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0">
          <Image
            src="/img/scan-leaf.png"
            alt="Scan leaf"
            width={80}
            height={80}
            className="object-contain p-2"
          />
        </div>
        
        {/* Text Content */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-brand-text-titles mb-2">
            Check your Cocoa
          </h2>
          <p className="text-brand-sub-text text-sm leading-relaxed">
            Take photos, start diagnose<br />
            diseases & get plant care tips
          </p>
        </div>
      </div>
      
      {/* Scan Now Button */}
      <Link 
        href="/scan" 
        className="block bg-brand-buttons text-white px-8 py-3 rounded-full text-sm font-semibold text-center transition-all hover:opacity-90 w-fit mx-auto"
      >
        Scan now
      </Link>
    </div>
  );
}
