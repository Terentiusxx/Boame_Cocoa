/**
 * ResultsPage.tsx
 * ─────────────────────────────────────────────────────────────
 * Disease results screen. Two modes:
 *   'known'   — disease detected; rich card with urgency, description, treatments
 *   'unknown' — could not identify; clear CTA to retry or contact expert
 */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiAlertTriangle, FiRefreshCw, FiMessageCircle } from 'react-icons/fi';
import { urgencyToUi } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiseaseOut = {
  disease_id?: number;
  name?: string;
  description?: string;
  urgency_level?: string;
  icon_name?: string;
  treatments?: { name?: string; description?: string }[];
  symptoms?: string;
  symtoms?: string; // backend typo alias
};

export type ScanOut = {
  scan_id?: number;
  disease_id?: number | null;
  confidence_score?: number;
  created_at?: string;
};

// ─── Urgency config ───────────────────────────────────────────────────────────

const URGENCY_CONFIG = {
  High:    { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',    dot: 'bg-red-500'    },
  Medium:  { bar: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  Low:     { bar: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500'  },
  Unknown: { bar: 'bg-gray-300',   badge: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400'   },
} as const;

// ─── Unknown result ───────────────────────────────────────────────────────────

function UnknownResult({ scanId }: { scanId?: number }) {
  const router = useRouter();
  const contactHref = scanId
    ? `${ROUTES.CONTACT}?scan_id=${scanId}`
    : ROUTES.CONTACT;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-12 pb-4">
        <button type="button" onClick={() => router.replace(ROUTES.HOME)} aria-label="Go home"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
          <FiArrowLeft size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12 text-center">
        {/* Icon */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center">
            <FiAlertTriangle size={44} className="text-orange-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Could Not Identify</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[260px] mb-10">
          We couldn&apos;t identify the disease from this image. Try again from a closer angle with better lighting.
        </p>

        <div className="w-full max-w-xs space-y-3">
          <Link href={ROUTES.SCAN}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95">
            <FiRefreshCw size={18} />
            Try Again
          </Link>

          <Link href={contactHref}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gray-900 py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95">
            <FiMessageCircle size={18} />
            Ask an Expert
          </Link>

          <Link href={ROUTES.HOME}
            className="block w-full py-3 text-center text-brand-hyperlink text-sm font-medium hover:opacity-70 transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Known disease result ─────────────────────────────────────────────────────

function KnownResult({
  scanId,
  scan,
  disease,
}: {
  scanId?: number;
  scan?: ScanOut | null;
  disease: DiseaseOut;
}) {
  const router = useRouter();
  const { label: urgencyLabel } = urgencyToUi(disease.urgency_level);
  const urgencyKey = (urgencyLabel.replace(' Urgency', '').replace(' Risk', '') as keyof typeof URGENCY_CONFIG) || 'Unknown';
  const urgencyStyle = URGENCY_CONFIG[urgencyKey] ?? URGENCY_CONFIG.Unknown;

  const confidence    = scan?.confidence_score != null ? Math.round(scan.confidence_score * 100) : null;
  const diseaseName   = disease.name ?? 'Unknown Disease';
  const treatments    = disease.treatments?.map((t) => t.name).filter(Boolean) as string[] | undefined;
  const symptoms      = disease.symptoms ?? disease.symtoms; // handle backend typo
  const contactHref   = scanId ? `${ROUTES.CONTACT}?scan_id=${scanId}` : ROUTES.CONTACT;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      {/* Coloured urgency bar at very top */}
      <div className={`h-1.5 w-full ${urgencyStyle.bar}`} />

      <div className="px-5 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-5">
          <button type="button" onClick={() => router.replace(ROUTES.HOME)}
            aria-label="Go home"
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Diagnosis</h1>
          <div className="w-9" />
        </div>

        {/* Disease hero card */}
        <div className="rounded-3xl bg-white border border-gray-100 shadow-card p-6 mb-5">
          {/* Icon placeholder — shows urgency colour circle */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${urgencyStyle.bar} bg-opacity-10`}>
              <span className={`w-7 h-7 rounded-full ${urgencyStyle.bar}`} />
            </div>

            {/* Urgency badge */}
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyStyle.badge}`}>
              {urgencyLabel}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">{diseaseName}</h2>

          {confidence != null && (
            <div className="flex items-center gap-2 mt-2">
              {/* Confidence bar */}
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-green rounded-full transition-all duration-700"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-medium tabular-nums">{confidence}% confident</span>
            </div>
          )}
        </div>

        {/* Description */}
        {disease.description && (
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">About</h3>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">{disease.description}</p>
            </div>
          </div>
        )}

        {/* Symptoms */}
        {symptoms && (
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Symptoms</h3>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">{symptoms}</p>
            </div>
          </div>
        )}

        {/* Treatments */}
        {treatments && treatments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Treatment</h3>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              {treatments.map((t, i) => (
                <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${i < treatments.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${urgencyStyle.dot}`} />
                  <p className="text-sm text-gray-700 leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link href={contactHref}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95">
            <FiMessageCircle size={18} />
            Talk to an Expert
          </Link>

          <Link href={ROUTES.SCAN}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gray-100 py-4 text-gray-900 font-semibold text-base hover:bg-gray-200 transition active:scale-95">
            <FiRefreshCw size={18} />
            Scan Another Plant
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ResultsPage({
  mode,
  scanId,
  scan,
  disease,
}: {
  mode: 'known' | 'unknown';
  scanId?: number;
  scan?: ScanOut | null;
  disease?: DiseaseOut | null;
}) {
  if (mode === 'unknown' || !disease) {
    return <UnknownResult scanId={scanId} />;
  }
  return <KnownResult scanId={scanId} scan={scan} disease={disease} />;
}
