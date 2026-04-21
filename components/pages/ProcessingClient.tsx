/**
 * ProcessingClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Shown while the AI processes the captured image.
 * Reads scan_image from sessionStorage, POSTs to /api/ai/predict,
 * saves the result, then navigates to the voice-describe or results page.
 *
 * Session storage keys (defined in lib/constants.ts):
 *   scan_image      — blob: or data: URL of the captured image
 *   scan_id         — numeric scan ID returned by backend
 *   scan_prediction — JSON { disease_id, confidence_score, created_at }
 */
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';
import { SESSION_KEYS, ROUTES } from '@/lib/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a data: URL string to a Blob object.
 * Needed because canvas.toBlob() result is stored as a data URL.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header?.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = atob(data ?? '');
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Load the scan image from sessionStorage as a Blob.
 * Handles both blob: object URLs and data: URLs.
 */
async function loadScanBlob(value: string): Promise<Blob> {
  if (value.startsWith('data:')) return dataUrlToBlob(value);
  const res = await fetch(value);
  if (!res.ok) throw new Error(`Failed to load scan image (${res.status})`);
  return res.blob();
}

/** Safely revoke a blob: URL to free memory */
function revokeIfBlob(url: string | null) {
  if (url?.startsWith('blob:')) {
    try { URL.revokeObjectURL(url); } catch { /* ignore */ }
  }
}

/** Extract scan_id from any backend prediction response shape */
function parseScanId(payload: unknown): number | null {
  const data = (payload && typeof payload === 'object' && 'data' in payload)
    ? (payload as Record<string, unknown>).data
    : payload;
  const candidate = (data as Record<string, unknown>)?.scan_id ?? (data as Record<string, unknown>)?.id;
  const n = Number(candidate);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProcessingClient() {
  const router = useRouter();
  /**
   * useRef persists across React Strict Mode's artificial double-effect invocation
   * on the SAME component instance — so Effect 2 sees hasRun=true and bails
   * immediately, preventing a second POST. The ref resets naturally when the user
   * navigates away (component truly unmounts) and back to /processing.
   */
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // Strict Mode guard — skip the second effect run
    hasRun.current = true;

    const run = async () => {
      const imageRef = sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE);

      // No image stored → send back to scan page
      if (!imageRef) {
        router.replace(ROUTES.SCAN);
        return;
      }

      try {
        const blob = await loadScanBlob(imageRef);
        const form = new FormData();
        form.append('file', blob, 'scan.jpg');

        const res = await fetch('/api/ai/predict', {
          method: 'POST',
          body: form,
          credentials: 'include',
        });

        const payload = await res.json().catch(() => null);
        const scanId  = parseScanId(payload);

        if (!res.ok || !scanId) {
          throw new Error((payload as Record<string, unknown>)?.message as string ?? 'Prediction failed');
        }

        // Store scan results for the results page to read
        sessionStorage.setItem(SESSION_KEYS.SCAN_ID, String(scanId));
        sessionStorage.setItem(
          SESSION_KEYS.SCAN_PREDICTION,
          JSON.stringify({
            disease_id:       (payload as Record<string, unknown>)?.disease_id       ?? null,
            confidence_score: (payload as Record<string, unknown>)?.confidence_score ?? null,
            created_at:       new Date().toISOString(),
          })
        );

        // Clean up image from session (no longer needed)
        revokeIfBlob(imageRef);
        sessionStorage.removeItem(SESSION_KEYS.SCAN_IMAGE);

        // Navigate to voice description before showing results.
        // router.replace is safe to call even if the component happened to unmount.
        router.replace(`${ROUTES.VOICE_DESCRIBE ?? '/voice-describe'}?scan_id=${scanId}`);
      } catch {
        // On any error, clean up and navigate to unknown result
        revokeIfBlob(sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE));
        sessionStorage.removeItem(SESSION_KEYS.SCAN_IMAGE);
        router.replace(`${ROUTES.RESULTS}/unknown`);
      }
    };

    void run();
  }, [router]);

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col items-center justify-center">
      <div className="px-6 text-center">

        {/* Spinner */}
        <div className="relative mb-8 mx-auto w-24 h-24">
          <div className="w-24 h-24 border-4 border-gray-200 rounded-full" />
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Image...</h2>
        <p className="text-gray-600 max-w-xs mx-auto">
          Our AI is examining your cocoa plant to identify any diseases or issues.
        </p>

        {/* Progress steps */}
        <div className="mt-8 space-y-3 text-sm">
          <div className="flex items-center justify-center gap-3 text-primary-green">
            <div className="w-4 h-4 bg-primary-green rounded-full flex items-center justify-center">
              <FiCheck size={10} className="text-white" />
            </div>
            Image captured successfully
          </div>

          <div className="flex items-center justify-center gap-3 text-primary-green">
            <div className="w-4 h-4 bg-primary-green rounded-full flex items-center justify-center">
              <FiCheck size={10} className="text-white" />
            </div>
            Processing with AI model
          </div>

          <div className="flex items-center justify-center gap-3 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full animate-pulse" />
            Generating diagnosis...
          </div>
        </div>
      </div>
    </div>
  );
}