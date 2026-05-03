/**
 * PredictResultsClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Reads the AI prediction from sessionStorage, then redirects to
 * /results/:id which is a fully server-rendered page.
 *
 * This avoids client-side disease fetching by leveraging the existing
 * server-driven results/[id] page that already fetches disease data
 * server-side.
 *
 * Flow:
 *   sessionStorage.scan_id present  → redirect to /results/:scan_id
 *   sessionStorage.scan_id missing  → redirect to /results/unknown
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SESSION_KEYS, ROUTES } from '@/lib/constants';

export default function PredictResultsClient() {
  const router = useRouter();

  useEffect(() => {
    // Read the scan_id written by ProcessingClient
    const scanId = sessionStorage.getItem(SESSION_KEYS.SCAN_ID);

    if (scanId && Number(scanId) > 0) {
      // Redirect to the server-rendered results page — it will fetch
      // /scans/:id and /diseases/:id on the server
      router.replace(`${ROUTES.RESULTS}/${scanId}`);
    } else {
      // No scan_id — show the unknown/failed result screen
      router.replace(`${ROUTES.RESULTS}/unknown`);
    }
  }, [router]);

  // Show spinner while sessionStorage is being read and redirect is happening
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
