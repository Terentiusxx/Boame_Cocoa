/**
 * ProcessingClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Shown while the AI processes the captured image.
 * Reads scan_image from sessionStorage, POSTs to /api/ai/predict,
 * saves the result, then navigates to the voice-describe or results page.
 *
 * Session storage keys (defined in lib/constants.ts):
 *   scan_image        — blob: or data: URL of the captured image
 *   scan_image_url    — backend original_image URL (Cloudinary)
 *   scan_id           — numeric scan ID returned by backend
 *   scan_prediction   — JSON { disease_id, confidence_score, created_at }
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { SESSION_KEYS, ROUTES } from '@/lib/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header?.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = atob(data ?? '');
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function loadScanBlob(value: string): Promise<Blob> {
  if (value.startsWith('data:')) return dataUrlToBlob(value);
  const res = await fetch(value);
  if (!res.ok) throw new Error(`Failed to load scan image (${res.status})`);
  return res.blob();
}

function revokeIfBlob(url: string | null) {
  if (url?.startsWith('blob:')) {
    try { URL.revokeObjectURL(url); } catch { /* ignore */ }
  }
}

function parseScanId(payload: unknown): number | null {
  const data = (payload && typeof payload === 'object' && 'data' in payload)
    ? (payload as Record<string, unknown>).data
    : payload;
  const candidate = (data as Record<string, unknown>)?.scan_id ?? (data as Record<string, unknown>)?.id;
  const n = Number(candidate);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

const FLOW_STEPS = ['Capture', 'Analyze', 'Describe', 'Results'] as const;

function StepIndicator() {
  return (
    <div className="flex items-center w-full">
      {FLOW_STEPS.map((label, i) => {
        const done   = i < 1;  // Capture done
        const active = i === 1; // Analyze is current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                done || active ? 'bg-brand-buttons border-brand-buttons text-white' : 'bg-white border-gray-300 text-gray-400',
              ].join(' ')}>
                {done ? <FiCheck size={14} className="text-white" /> : <span>{i + 1}</span>}
              </div>
              <span className={[
                'text-[10px] font-medium',
                active ? 'text-primary-green' : done ? 'text-brand-buttons' : 'text-gray-400',
              ].join(' ')}>
                {label}
              </span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className={[
                'flex-1 h-0.5 mx-1 mb-4 rounded-full',
                i < 1 ? 'bg-brand-buttons' : 'bg-gray-200',
              ].join(' ')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Circular Progress Ring ────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 88;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      {/* Outer decorative dots */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(45,125,50,0.06) 0%, transparent 70%)',
      }} />

      {/* SVG ring */}
      <svg className="absolute inset-0 -rotate-90" width="208" height="208" viewBox="0 0 208 208">
        {/* Track */}
        <circle cx="104" cy="104" r={r} fill="none" stroke="#e5f0e5" strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="104" cy="104" r={r}
          fill="none"
          stroke="#1f4e20"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>

      {/* Inner green circle + cocoa leaf SVG */}
      <div className="w-36 h-36 rounded-full bg-green-50 flex items-center justify-center z-10">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Simple cocoa pod + leaves illustration */}
          <ellipse cx="40" cy="50" rx="12" ry="20" fill="#4caf50" opacity="0.8"/>
          <ellipse cx="40" cy="50" rx="9" ry="17" fill="#2d7d32" opacity="0.9"/>
          {/* Left leaf */}
          <path d="M40 30 C28 22 18 28 22 42 C28 36 36 32 40 30Z" fill="#4caf50"/>
          <path d="M40 30 C31 28 28 36 22 42" stroke="#2d7d32" strokeWidth="1" fill="none"/>
          {/* Right leaf */}
          <path d="M40 30 C52 22 62 28 58 42 C52 36 44 32 40 30Z" fill="#66bb6a"/>
          <path d="M40 30 C49 28 52 36 58 42" stroke="#2d7d32" strokeWidth="1" fill="none"/>
          {/* Stem */}
          <line x1="40" y1="30" x2="40" y2="18" stroke="#2d7d32" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Top leaves */}
          <path d="M40 18 C34 10 26 14 28 22 C33 18 37 16 40 18Z" fill="#4caf50"/>
          <path d="M40 18 C46 10 54 14 52 22 C47 18 43 16 40 18Z" fill="#66bb6a"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Step Checklist ────────────────────────────────────────────────────────────

type StepStatus = 'done' | 'active' | 'waiting';

function CheckStep({ label, status }: { label: string; status: StepStatus }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        {status === 'done' && (
          <div className="w-7 h-7 rounded-full bg-brand-buttons flex items-center justify-center shrink-0">
            <FiCheck size={13} className="text-white" />
          </div>
        )}
        {status === 'active' && (
          <div className="w-7 h-7 rounded-full border-2 border-primary-green flex items-center justify-center shrink-0">
            <div className="w-3 h-3 rounded-full border-2 border-primary-green border-t-transparent animate-spin" />
          </div>
        )}
        {status === 'waiting' && (
          <div className="w-7 h-7 rounded-full border-2 border-gray-300 shrink-0" />
        )}
        <span className={[
          'text-sm',
          status === 'waiting' ? 'text-gray-400' : 'text-brand-text-titles',
        ].join(' ')}>
          {label}
        </span>
      </div>
      {status === 'done'    && <FiCheck size={15} className="text-primary-green" />}
      {status === 'active'  && <span className="text-xs font-semibold text-primary-green">In progress</span>}
      {status === 'waiting' && <span className="text-xs text-gray-400">Waiting</span>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProcessingClient() {
  const router  = useRouter();
  const hasRun  = useRef(false);

  // Simulated progress: animates 0→95 while waiting for API, jumps to 100 on done
  const [pct,      setPct]      = useState(0);
  const [stepIdx,  setStepIdx]  = useState(0); // 0=quality, 1=detecting, 2=analyzing, 3=generating

  // Simulate step progression while API runs
  useEffect(() => {
    const t1 = setTimeout(() => setStepIdx(1), 800);
    const t2 = setTimeout(() => setStepIdx(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Animate progress bar 0 → 92 during analysis
  useEffect(() => {
    const interval = setInterval(() => {
      setPct((prev) => {
        if (prev >= 92) { clearInterval(interval); return 92; }
        // Slow down as it approaches 92
        const increment = prev < 60 ? 3 : prev < 80 ? 1.5 : 0.5;
        return Math.min(92, prev + increment);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const imageRef = sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE);
      if (!imageRef) { router.replace(ROUTES.SCAN); return; }

      try {
        const blob = await loadScanBlob(imageRef);
        const form = new FormData();
        form.append('file', blob, 'scan.jpg');

        const res     = await fetch('/api/ai/predict', { method: 'POST', body: form, credentials: 'include' });
        const payload = await res.json().catch(() => null);
        const scanId  = parseScanId(payload);

        if (!res.ok || !scanId) {
          throw new Error((payload as Record<string, unknown>)?.message as string ?? 'Prediction failed');
        }

        // Unwrap data envelope
        const p = (payload && typeof payload === 'object' && 'data' in payload)
          ? (payload as Record<string, unknown>).data as Record<string, unknown>
          : payload as Record<string, unknown>;

        sessionStorage.setItem(SESSION_KEYS.SCAN_ID, String(scanId));
        sessionStorage.setItem(SESSION_KEYS.SCAN_PREDICTION, JSON.stringify({
          disease_id:       p?.disease_id       ?? null,
          confidence_score: p?.confidence_score ?? p?.confidence ?? null,
          created_at:       new Date().toISOString(),
        }));

        // Save original_image URL (Cloudinary) for VoiceDescribe + Results pages
        const imageUrl = typeof p?.original_image === 'string' ? p.original_image
          : typeof p?.image_url === 'string' ? p.image_url
          : null;
        if (imageUrl) sessionStorage.setItem(SESSION_KEYS.SCAN_IMAGE_URL, imageUrl);

        // Clean up local blob
        revokeIfBlob(imageRef);
        sessionStorage.removeItem(SESSION_KEYS.SCAN_IMAGE);

        // Finish progress animation, then navigate
        setPct(100);
        setStepIdx(3);
        setTimeout(() => {
          router.replace(`${ROUTES.VOICE_DESCRIBE ?? '/voice-describe'}?scan_id=${scanId}`);
        }, 600);
      } catch {
        revokeIfBlob(sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE));
        sessionStorage.removeItem(SESSION_KEYS.SCAN_IMAGE);
        router.replace(`${ROUTES.RESULTS}/unknown`);
      }
    };

    void run();
  }, [router]);


  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-5 pb-10 pt-12">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-10">
          <button
            type="button"
            onClick={() => router.replace(ROUTES.SCAN)}
            aria-label="Go back"
            className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 rounded-full hover:bg-black/5 transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <StepIndicator />
          </div>
        </div>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-text-titles mb-2">Analyzing Your Plant</h1>
          <p className="text-sm text-brand-sub-text leading-relaxed max-w-[260px] mx-auto">
            Our AI is examining your image for signs of disease. This may take a few seconds.
          </p>
        </div>

        {/* ── Circular progress + illustration ─────────────────────────── */}
        <div className="flex flex-col items-center mb-8">
          <ProgressRing pct={pct} />
          <p className="text-4xl font-bold text-brand-text-titles mt-4 tabular-nums">{Math.round(pct)}%</p>
          <p className="text-sm text-brand-sub-text mt-1">
            {pct >= 100 ? 'Complete!' : 'Analyzing...'}
          </p>
        </div>

        {/* ── Tip card ──────────────────────────────────────────────────── */}
        <div className="bg-green-50 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-9 h-9 rounded-full bg-brand-buttons flex items-center justify-center shrink-0">
            <HiOutlineLightBulb size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-text-titles">Tip</p>
            <p className="text-sm text-brand-sub-text mt-0.5">
              For the best results, make sure the image is clear and well-lit.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

