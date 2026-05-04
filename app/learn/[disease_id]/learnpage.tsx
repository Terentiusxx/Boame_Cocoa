'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiUser,
} from 'react-icons/fi';
import { getDiseaseLocalImage } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

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

function getUrgencyStyle(urgency?: string) {
  const v = urgency?.toLowerCase();
  if (v === 'high')   return { label: 'High Urgency',   bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' };
  if (v === 'medium') return { label: 'Medium Urgency', bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' };
  if (v === 'low')    return { label: 'Low Urgency',    bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' };
  return { label: 'Unknown', bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' };
}

export default function LearnPage({ disease }: { disease: DiseaseOut }) {
  const router = useRouter();
  const diseaseName = disease.name ?? 'Unknown';
  const heroImage = getDiseaseLocalImage(diseaseName);
  const symptoms = disease.symptoms ?? disease.symtoms;
  const urgencyStyle = getUrgencyStyle(disease.urgency_level);
  const treatments = disease.treatments ?? [];

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">

      {/* ── Hero Image ──────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-gray-200">
        <Image
          src={heroImage}
          alt={diseaseName}
          fill
          className="object-cover"
        />
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-5 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm"
        >
          <FiArrowLeft size={18} />
        </button>
        {/* Urgency badge */}
        <div className={`absolute top-12 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${urgencyStyle.bg}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${urgencyStyle.dot}`} />
          <span className={`text-xs font-semibold ${urgencyStyle.text}`}>{urgencyStyle.label}</span>
        </div>
      </div>

      {/* ── Content Sheet ────────────────────────────────────────────────── */}
      <div className="relative -mt-7 z-10 rounded-t-3xl bg-white pb-10">

        <div className="px-5 pt-7 pb-4">
          <h1 className="text-2xl font-bold text-brand-text-titles">{diseaseName}</h1>
        </div>

        {/* ── About ─────────────────────────────────────────────────────── */}
        {disease.description && (
          <section className="px-5 mb-5">
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-wide mb-2">About</h2>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-brand-text-titles leading-relaxed">
              {disease.description}
            </div>
          </section>
        )}

        {/* ── Symptoms ──────────────────────────────────────────────────── */}
        {symptoms && (
          <section className="px-5 mb-5">
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-wide mb-2">Symptoms</h2>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-brand-text-titles leading-relaxed">
              {symptoms}
            </div>
          </section>
        )}

        {/* ── Treatments ────────────────────────────────────────────────── */}
        {treatments.length > 0 && (
          <section className="px-5 mb-5">
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-wide mb-2">Treatment Steps</h2>
            <div className="space-y-2">
              {treatments.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="w-6 h-6 rounded-full bg-brand-buttons flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheckCircle size={13} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {t.name && (
                      <p className="text-sm font-semibold text-brand-text-titles">{t.name}</p>
                    )}
                    {t.description && (
                      <p className="text-xs text-brand-sub-text mt-0.5">{t.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Early Action Tip ──────────────────────────────────────────── */}
        <div className="px-5 mb-5">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <FiAlertTriangle size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700">Early detection prevents spread.</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Treating early increases the chance of saving your yield.
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="px-5 space-y-3">
          <Link
            href={ROUTES.SCAN}
            className="flex items-center justify-center gap-2 bg-brand-buttons text-white py-4 rounded-brand text-sm font-semibold w-full"
          >
            <FiRefreshCw size={15} />
            Scan Another Plant
          </Link>
          <Link
            href={ROUTES.CONTACT}
            className="flex items-center justify-center gap-2 border border-brand-buttons text-brand-buttons py-4 rounded-brand text-sm font-semibold w-full"
          >
            <FiUser size={15} />
            Contact an Expert
          </Link>
        </div>

      </div>
    </div>
  );
}
