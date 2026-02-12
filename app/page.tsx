'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to splash screen
    router.replace('/splash');
  }, [router]);

  return (
    <div className="mobile-container">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-4">Boame Cocoa</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}
