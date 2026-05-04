'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiChevronRight,
  FiSearch,
  FiBook,
  FiSun,
  FiCalendar,
  FiDroplet,
} from 'react-icons/fi';
import { getDiseaseLocalImage } from '@/lib/utils';
import { ROUTES, SESSION_KEYS } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiseaseOut = {
  disease_id?: number;
  name?: string;
  description?: string;
  urgency_level?: string;
  icon_name?: string;
  treatments?: { name?: string; description?: string }[];
  symptoms?: string;
  symtoms?: string;
};

export type ScanOut = {
  scan_id?: number;
  disease_id?: number | null;
  confidence_score?: number;
  image_url?: string;
  created_at?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeverity(urgency?: string) {
  const v = urgency?.toLowerCase();
  if (v === 'high')   return { label: 'Severe',   dotClass: 'bg-red-500',   textClass: 'text-red-600' };
  if (v === 'medium') return { label: 'Moderate', dotClass: 'bg-amber-400', textClass: 'text-amber-600' };
  if (v === 'low')    return { label: 'Mild',     dotClass: 'bg-green-500', textClass: 'text-green-600' };
  return { label: 'Unknown', dotClass: 'bg-gray-400', textClass: 'text-gray-500' };
}

function getDiseaseAttributes(name?: string) {
  const v = (name ?? '').toLowerCase();
  if (v.includes('black pod'))
    return { type: 'Fungal', canSpread: 'Yes', conditions: 'Wet & Humid' };
  if (v.includes('cssvd') || v.includes('swollen shoot') || v.includes('swollen'))
    return { type: 'Viral', canSpread: 'Yes', conditions: 'Any Season' };
  if (v.includes('witches') || v.includes('broom'))
    return { type: 'Fungal', canSpread: 'Yes', conditions: 'High Humidity' };
  if (v.includes('frosty') || v.includes('pod rot'))
    return { type: 'Fungal', canSpread: 'Yes', conditions: 'Wet & Cold' };
  if (v.includes('vascular') || v.includes('vsd') || v.includes('streak'))
    return { type: 'Fungal', canSpread: 'Yes', conditions: 'High Humidity' };
  if (v.includes('pest'))
    return { type: 'Pest', canSpread: 'Yes', conditions: 'Any Season' };
  return { type: 'Unknown', canSpread: 'Unknown', conditions: 'Any Season' };
}

// ─── Unknown Result ───────────────────────────────────────────────────────────

function UnknownResult({ scanId: _scanId }: { scanId?: number }) {
  const router = useRouter();

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col">
      <div className="flex-1 flex flex-col px-6 pb-10 pt-10">

        {/* ── Close button ────────────────────────────────────────────── */}
        <div className="mb-auto">
          <button
            type="button"
            onClick={() => router.replace(ROUTES.HOME)}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <span className="text-xl font-light text-brand-text-titles leading-none">✕</span>
          </button>
        </div>

        {/* ── Centred content ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center py-10">
          {/* Green refresh icon circle */}
          <div className="w-24 h-24 rounded-full bg-primary-green flex items-center justify-center">
            <FiRefreshCw size={40} className="text-white" strokeWidth={2.5} />
          </div>

          <h2 className="text-4xl font-extrabold text-brand-text-titles">Unknown</h2>

          <p className="text-sm text-brand-sub-text leading-relaxed max-w-[260px]">
            We cannot identify the disease your cocoa has.
            Please try again from a different angle.
          </p>
        </div>

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="w-full space-y-3 mt-6">
          <Link
            href={ROUTES.SCAN}
            className="flex items-center justify-center bg-brand-buttons text-white py-4 rounded-brand w-full text-base font-semibold"
          >
            Try Again
          </Link>
          <Link
            href={ROUTES.CONTACT}
            className="flex items-center justify-center bg-brand-buttons text-white py-4 rounded-brand w-full text-base font-semibold"
          >
            Contact Expert
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Known Result ─────────────────────────────────────────────────────────────

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
  const posted = useRef(false);
  const [scanImageSrc, setScanImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (posted.current) return;
    posted.current = true;
    if (typeof scanId === 'number') {
      fetch('/api/history/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id: scanId }),
      }).catch(() => null);
    }
  }, [scanId]);

  // Prefer sessionStorage image (fresh capture), fall back to backend URL
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE);
    setScanImageSrc(stored ?? scan?.image_url ?? null);
  }, [scan?.image_url]);

  const diseaseName = disease.name ?? 'Unknown Disease';
  const heroImage = getDiseaseLocalImage(diseaseName);
  const confidence = Math.round((scan?.confidence_score ?? 0) * 100);
  const severity = getSeverity(disease.urgency_level);
  const attrs = getDiseaseAttributes(diseaseName);
  const nextStep =
    disease.treatments?.[0]?.name ??
    'Inspect surrounding pods and consult an expert for treatment.';
  const contactHref = scanId ? `${ROUTES.CONTACT}?scan_id=${scanId}` : ROUTES.CONTACT;
  const learnHref = disease.disease_id ? `/learn/${disease.disease_id}` : ROUTES.LEARN;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-5 pb-28 pt-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.replace(ROUTES.HOME)}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-base font-semibold text-brand-text-titles">Scan Results</h1>
          <Link
            href={learnHref}
            aria-label="Learn about this disease"
            className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center text-brand-text-titles text-sm font-bold"
          >
            ?
          </Link>
        </div>

        {/* ── Detection Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-card">
          <div className="flex gap-3 items-start">
            {/* Disease illustration */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-orange-50 shrink-0">
              <Image src={heroImage} alt={diseaseName} fill className="object-cover" />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
                <FiAlertTriangle size={10} className="text-white" />
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-green-100 text-primary-green text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                Likely
              </span>
              <h2 className="text-lg font-bold text-brand-text-titles leading-tight">
                {diseaseName} Detected
              </h2>
              <p className="text-xs text-brand-sub-text mt-0.5">
                Signs of this disease were found in your scanned image.
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats: Confidence + Severity ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-xs text-brand-sub-text mb-1">Confidence</p>
            <p className="text-2xl font-bold text-brand-text-titles">{confidence}%</p>
            <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-green transition-all"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-xs text-brand-sub-text mb-1">Severity</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-base font-bold ${severity.textClass}`}>
                {severity.label}
              </span>
              <span className={`w-3 h-3 rounded-full shrink-0 ${severity.dotClass}`} />
            </div>
          </div>
        </div>

        {/* ── Scanned Image ────────────────────────────────────────────── */}
        {scanImageSrc && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-brand-text-titles mb-2">Scanned Image</p>
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100">
              <Image
                src={scanImageSrc}
                alt="Your scanned image"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                aria-label="Zoom image"
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
              >
                <FiSearch size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Recommended Next Step ────────────────────────────────────── */}
        <div className="bg-green-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-buttons flex items-center justify-center shrink-0">
            <FiBook size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-text-titles">Recommended Next Step</p>
            <p className="text-xs text-brand-sub-text mt-0.5 line-clamp-3">{nextStep}</p>
          </div>
          <FiChevronRight size={18} className="text-brand-sub-text shrink-0" />
        </div>

        {/* ── Disease Attributes ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <FiSun size={16} className="mx-auto mb-1 text-brand-sub-text" />
            <p className="text-[10px] text-brand-sub-text">Disease Type</p>
            <p className="text-xs font-semibold text-brand-text-titles mt-0.5">{attrs.type}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <FiCalendar size={16} className="mx-auto mb-1 text-brand-sub-text" />
            <p className="text-[10px] text-brand-sub-text">Can Spread</p>
            <p className="text-xs font-semibold text-brand-text-titles mt-0.5">{attrs.canSpread}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-card text-center">
            <FiDroplet size={16} className="mx-auto mb-1 text-brand-sub-text" />
            <p className="text-[10px] text-brand-sub-text">Conditions</p>
            <p className="text-xs font-semibold text-brand-text-titles mt-0.5">{attrs.conditions}</p>
          </div>
        </div>

        {/* ── Early Action Banner ──────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <FiAlertTriangle size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700">Early action can prevent crop loss.</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Treating early increases the chance of saving your yield.
            </p>
          </div>
        </div>

        {/* ── Learn More Button ────────────────────────────────────────── */}
        <Link
          href={learnHref}
          className="flex items-center justify-between bg-brand-buttons text-white py-4 px-5 rounded-brand mb-3 text-sm font-semibold"
        >
          <div className="flex items-center gap-2">
            <FiBook size={16} />
            Learn More About {diseaseName.split(' ')[0]}
          </div>
          <FiChevronRight size={18} />
        </Link>

        {/* ── Bottom Actions ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={contactHref}
            className="flex items-center justify-center gap-2 border border-brand-buttons text-brand-buttons py-4 rounded-brand text-sm font-semibold"
          >
            <FiUser size={15} />
            Contact Expert
          </Link>
          <Link
            href={ROUTES.SCAN}
            className="flex items-center justify-center gap-2 border border-brand-buttons text-brand-buttons py-4 rounded-brand text-sm font-semibold"
          >
            <FiRefreshCw size={15} />
            Scan Again
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Default Export ───────────────────────────────────────────────────────────

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
