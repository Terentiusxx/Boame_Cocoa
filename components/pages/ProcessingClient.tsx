'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

type ScanCreateResponse = {
  data?: { scan_id?: number; id?: number };
  scan_id?: number;
  id?: number;
};

export default function ProcessingClient() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const imageDataUrl = sessionStorage.getItem('scan_image');
      if (!imageDataUrl) {
        router.replace('/scan');
        return;
      }

      try {
        const response = await fetch('/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageDataUrl,
            confidence_score: 0,
          }),
        });

        const payload = (await response.json().catch(() => null)) as ScanCreateResponse | null;
        const scanId = payload?.data?.scan_id ?? payload?.scan_id ?? payload?.data?.id ?? payload?.id;

        sessionStorage.removeItem('scan_image');

        if (cancelled) return;

        if (!response.ok || !scanId) {
          router.replace('/results/unknown');
          return;
        }

        router.replace(`/results/${scanId}`);
      } catch {
        if (cancelled) return;
        router.replace('/results/unknown');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Image...</h2>

        <p className="text-gray-600 leading-relaxed max-w-xs">
          Our AI is examining your cocoa plant to identify any diseases or issues.
        </p>

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
