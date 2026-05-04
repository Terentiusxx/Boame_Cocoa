/**
 * VoiceDescribeClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Voice description screen — step 3 of the scan flow.
 * Shows step progress, captured image preview, tips card,
 * tap-and-hold mic recorder, skip option, and privacy note.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiCamera, FiShield, FiCheckCircle } from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import VoiceRecorder from '@/components/VoiceRecorder';
import { SESSION_KEYS, ROUTES } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/utils';

// ─── Step Progress ────────────────────────────────────────────────────────────

const STEPS = ['Capture', 'Analyze', 'Describe', 'Results'] as const;

function StepIndicator() {
  return (
    <div className="flex items-center w-full px-1">
      {STEPS.map((label, i) => {
        const done   = i < 2;  // Capture & Analyze already done
        const active = i === 2; // Describe is current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  done   ? 'bg-brand-buttons border-brand-buttons text-white' : '',
                  active ? 'bg-brand-buttons border-brand-buttons text-white' : '',
                  !done && !active ? 'bg-white border-gray-300 text-gray-400' : '',
                ].join(' ')}
              >
                {done ? (
                  <FiCheckCircle size={15} className="text-white" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={[
                  'text-[10px] font-medium',
                  active ? 'text-primary-green' : done ? 'text-brand-buttons' : 'text-gray-400',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {/* Connector line (skip after last) */}
            {i < STEPS.length - 1 && (
              <div
                className={[
                  'flex-1 h-0.5 mx-1 mb-4 rounded-full',
                  i < 2 ? 'bg-brand-buttons' : 'bg-gray-200',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceDescribeClient({ scanId }: { scanId?: string }) {
  const router = useRouter();

  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [done,         setDone]         = useState(false);
  const [scanImageSrc, setScanImageSrc] = useState<string | null>(null);

  // Read image from sessionStorage — prefer backend URL (set after upload),
  // fall back to local blob (if somehow still present)
  useEffect(() => {
    const backendUrl = sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE_URL);
    const localBlob  = sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE);
    setScanImageSrc(backendUrl ?? localBlob ?? null);
  }, []);

  const skipHref = scanId ? `/results/${scanId}` : ROUTES.RESULTS + '/predict';

  const handleRecordingComplete = async (blob: Blob) => {
    setError(null);
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('file', blob, 'voice.webm');
      if (scanId) form.append('scan_id', scanId);

      const res     = await fetch('/api/ai/voice-diagnose', { method: 'POST', body: form, credentials: 'include' });
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
      const destination = scanId ? `/results/${scanId}` : '/results/predict';
      setTimeout(() => router.replace(destination), 900);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-5 pb-10 pt-12">

        {/* ── Top bar: back + step indicator ──────────────────────────── */}
        <div className="flex items-start gap-3 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 rounded-full hover:bg-black/5 transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <StepIndicator />
          </div>
        </div>

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <div className="text-center mb-6 px-4">
          <h1 className="text-2xl font-bold text-brand-text-titles leading-tight mb-2">
            Help us understand better
          </h1>
          <p className="text-sm text-brand-sub-text leading-relaxed">
            Describe what you&apos;re seeing on your cocoa plant.
            Your voice helps us give a more accurate diagnosis.
          </p>
        </div>

        {/* ── Scanned image preview ────────────────────────────────────── */}
        {scanImageSrc && (
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-200 mb-5">
            <Image
              src={scanImageSrc}
              alt="Your scanned image"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              <FiCamera size={12} />
              Image captured
            </div>
          </div>
        )}

        {/* ── Tips card ────────────────────────────────────────────────── */}
        <div className="bg-green-50 rounded-2xl p-4 mb-8 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-brand-buttons flex items-center justify-center shrink-0 mt-0.5">
            <HiOutlineLightBulb size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-text-titles mb-2">
              What to mention (examples)
            </p>
            <ul className="space-y-1 text-sm text-brand-sub-text">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sub-text shrink-0" />
                What the leaves, pods or stem look like
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sub-text shrink-0" />
                When you first noticed it
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sub-text shrink-0" />
                Any changes or what you&apos;ve tried
              </li>
            </ul>
          </div>
        </div>

        {/* ── Recorder ─────────────────────────────────────────────────── */}
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <FiCheckCircle size={36} className="text-primary-green" />
            </div>
            <p className="text-sm font-semibold text-brand-text-titles">Got it!</p>
            <p className="text-xs text-brand-sub-text">Analysing your description…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-4">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onError={(msg) => setError(msg)}
              isSubmitting={submitting}
            />

            {/* Instruction labels */}
            {!submitting && (
              <div className="text-center">
                <p className="text-base font-bold text-brand-text-titles">Tap and hold to speak</p>
                <p className="text-sm text-brand-sub-text mt-0.5">Release to stop</p>
              </div>
            )}

            {/* Sending indicator */}
            {submitting && (
              <div className="flex items-center gap-2 text-sm text-brand-sub-text">
                <div className="w-4 h-4 border-2 border-primary-green border-t-transparent rounded-full animate-spin" />
                Sending to AI…
              </div>
            )}

            {/* Error */}
            {error && (
              <div role="alert" className="w-full rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Skip ─────────────────────────────────────────────────────── */}
        {!done && !submitting && (
          <div className="text-center mt-6 mb-8">
            <button
              type="button"
              onClick={() => router.replace(skipHref)}
              className="text-sm text-brand-sub-text underline underline-offset-2 hover:text-brand-text-titles transition"
            >
              Skip this step
            </button>
          </div>
        )}

        {/* ── Privacy note ─────────────────────────────────────────────── */}
        {!done && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 mt-auto">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <FiShield size={15} className="text-brand-sub-text" />
            </div>
            <p className="text-xs text-brand-sub-text leading-relaxed">
              <span className="font-semibold text-brand-text-titles">Your voice is used only to improve diagnosis</span>
              {' '}and is kept private and secure.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

