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

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      const imageDataUrl = sessionStorage.getItem('scan_image');
      const nonce = sessionStorage.getItem('scan_nonce') || '';

      const inflightKey = nonce ? `scan_inflight_${nonce}` : '';
      const resultKey = nonce ? `scan_result_${nonce}` : '';
      const errorKey = nonce ? `scan_error_${nonce}` : '';

      if (!imageDataUrl) {
        router.replace('/scan');
        return;
      }

      // If a previous mount already completed, immediately continue.
      if (resultKey) {
        const existingScanId = sessionStorage.getItem(resultKey);
        if (existingScanId) {
          sessionStorage.removeItem('scan_image');
          sessionStorage.removeItem('scan_nonce');
          sessionStorage.removeItem(inflightKey);
          sessionStorage.removeItem(errorKey);
          if (!cancelled) router.replace(`/results/${existingScanId}`);
          return;
        }
      }

      // If another mount already started the request, wait for it to finish.
      if (inflightKey && sessionStorage.getItem(inflightKey) === '1') {
        for (let i = 0; i < 80; i++) {
          if (cancelled) return;

          const finishedScanId = resultKey ? sessionStorage.getItem(resultKey) : null;
          if (finishedScanId) {
            sessionStorage.removeItem('scan_image');
            sessionStorage.removeItem('scan_nonce');
            sessionStorage.removeItem(inflightKey);
            sessionStorage.removeItem(errorKey);
            router.replace(`/results/${finishedScanId}`);
            return;
          }

          if (errorKey && sessionStorage.getItem(errorKey) === '1') {
            sessionStorage.removeItem('scan_image');
            sessionStorage.removeItem('scan_nonce');
            sessionStorage.removeItem(inflightKey);
            router.replace('/results/unknown');
            return;
          }

          await sleep(150);
        }

        router.replace('/results/unknown');
        return;
      }

      if (inflightKey) sessionStorage.setItem(inflightKey, '1');

      try {
        const response = await fetch('/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageDataUrl,
          }),
        });

        const payload = (await response.json().catch(() => null)) as ScanCreateResponse | null;
        const scanId = payload?.data?.scan_id ?? payload?.scan_id ?? payload?.data?.id ?? payload?.id;

        if (nonce && scanId && resultKey) {
          sessionStorage.setItem(resultKey, String(scanId));
        }

        if (nonce && (!response.ok || !scanId) && errorKey) {
          sessionStorage.setItem(errorKey, '1');
        }

        if (inflightKey) sessionStorage.removeItem(inflightKey);
        sessionStorage.removeItem('scan_image');
        sessionStorage.removeItem('scan_nonce');

        if (cancelled) return;

        if (!response.ok || !scanId) {
          router.replace('/results/unknown');
          return;
        }

        router.replace(`/results/${scanId}`);
      } catch {
        if (nonce && errorKey) sessionStorage.setItem(errorKey, '1');
        if (inflightKey) sessionStorage.removeItem(inflightKey);
        sessionStorage.removeItem('scan_image');
        sessionStorage.removeItem('scan_nonce');
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
