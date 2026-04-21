/**
 * VoiceDescribeClient.tsx
 * ─────────────────────────────────────────────────────────────
 * AI assistant voice screen — minimal, atmospheric, focused.
 * Records symptoms then sends audio to the AI endpoint.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import VoiceRecorder from '@/components/VoiceRecorder';
import { ROUTES, SESSION_KEYS } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/utils';

export default function VoiceDescribeClient({ scanId }: { scanId?: string }) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [done,       setDone]       = useState(false);

  const handleRecordingComplete = async (blob: Blob) => {
    setError(null);
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('file', blob, 'voice.webm');
      if (scanId) form.append('scan_id', scanId);

      const endpoint = '/api/ai/voice-diagnose';

      const res     = await fetch(endpoint, { method: 'POST', body: form, credentials: 'include' });
      const payload = await res.json().catch(() => null) as Record<string, unknown> | null;

      if (!res.ok) {
        setError(extractErrorMessage(payload, 'Voice submission failed. Please try again.'));
        return;
      }

      if (payload?.disease_id || payload?.confidence_score) {
        sessionStorage.setItem(SESSION_KEYS.SCAN_PREDICTION, JSON.stringify({
          disease_id:       payload.disease_id       ?? null,
          confidence_score: payload.confidence_score ?? null,
          created_at:       new Date().toISOString(),
        }));
      }

      setDone(true);
      setTimeout(() => router.replace(ROUTES.RESULTS), 900);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
        >
          <FiArrowLeft size={18} />
        </button>

        {/* Skip to results */}
        <Link
          href={ROUTES.RESULTS}
          className="text-sm text-brand-hyperlink font-medium flex items-center gap-1 hover:opacity-70 transition"
        >
          Skip <FiChevronRight size={15} />
        </Link>
      </div>

      {/* Main content — vertically centred */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12">

        {/* AI avatar orb at top */}
        <div className="mb-6 relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-green to-green-700 flex items-center justify-center shadow-lg">
            {/* Leaf / AI icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a7 7 0 0 1-7 7Z" />
              <path d="M12 20v-9" />
            </svg>
          </div>
          {/* Subtle glow */}
          <div className="absolute inset-0 rounded-full bg-primary-green/20 blur-xl scale-150 -z-10" />
        </div>

        {/* Heading */}
        {!done ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Tell me what you see
            </h1>
            <p className="text-gray-400 text-sm text-center mb-10 leading-relaxed max-w-[220px]">
              Describe the condition of your cocoa leaves, pods, or stems
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Got it!</h1>
            <p className="text-gray-400 text-sm text-center mb-10">Analysing your description…</p>
          </>
        )}

        {/* Error */}
        {error && (
          <div role="alert" className="mb-6 w-full max-w-xs rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Voice recorder orb */}
        {!done && (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isSubmitting={submitting}
          />
        )}

        {/* Submitting indicator */}
        {submitting && (
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-primary-green border-t-transparent rounded-full animate-spin" />
            Sending to AI…
          </div>
        )}

        {/* Done state checkmark */}
        {done && (
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      {!done && !submitting && (
        <div className="pb-10 text-center">
          <p className="text-xs text-gray-300">Your voice is processed securely by our AI</p>
        </div>
      )}
    </div>
  );
}
