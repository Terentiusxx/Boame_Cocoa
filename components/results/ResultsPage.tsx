/**
 * ResultsPage.tsx
 * ─────────────────────────────────────────────────────────────
 * Disease results screen. Two modes:
 *   'known'   — disease detected; immersive hero image + rich detail card
 *   'unknown' — could not identify; clear CTAs to retry or contact expert
 *
 * Layout inspired by the reference mockup:
 *   • Full-bleed disease image fills top ~40% of screen
 *   • White rounded card slides up over the image
 *   • Disease name, confidence, description, symptoms, treatments
 *   • "Still having issues?" expert CTA anchored at the bottom
 */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft, FiAlertTriangle, FiRefreshCw,
  FiMessageCircle, FiCheckCircle, FiShield,
} from 'react-icons/fi';
import { urgencyToUi, getDiseaseLocalImage } from '@/lib/utils';
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

const URGENCY = {
  High:    { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',          ring: 'ring-red-200'    },
  Medium:  { bar: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200',    ring: 'ring-amber-200'  },
  Low:     { bar: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200',    ring: 'ring-green-200'  },
  Unknown: { bar: 'bg-gray-300',   badge: 'bg-gray-50 text-gray-500 border-gray-200',       ring: 'ring-gray-200'   },
} as const;

// ─── Expert CTA banner — shared across both modes ─────────────────────────────

function ExpertCTA({ contactHref }: { contactHref: string }) {
  return (
    <div className="mx-5 mb-8 rounded-2xl bg-green-50 border border-green-100 p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-brand-buttons flex items-center justify-center shrink-0">
        <FiMessageCircle size={17} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-text-titles">Still having issues?</p>
        <p className="text-xs text-brand-sub-text mt-0.5 leading-relaxed">
          A certified cocoa expert can review your case and give tailored advice.
        </p>
        <Link
          href={contactHref}
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary-green hover:underline"
        >
          Get in touch with an expert →
        </Link>
      </div>
    </div>
  );
}

// ─── Unknown result ───────────────────────────────────────────────────────────

function UnknownResult({ scanId }: { scanId?: number }) {
  const router = useRouter();
  const contactHref = scanId ? `${ROUTES.CONTACT}?scan_id=${scanId}` : ROUTES.CONTACT;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col">

      {/* Hero image — greyed out for unknown */}
      <div className="relative h-64 bg-gray-100 shrink-0">
        <Image
          src="/img/unknown.png"
          alt="Unknown disease"
          fill
          className="object-cover opacity-40"
          priority
        />
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.replace(ROUTES.HOME)}
          aria-label="Go home"
          className="absolute top-12 left-5 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 shadow hover:bg-white transition"
        >
          <FiArrowLeft size={18} />
        </button>
      </div>

      {/* White card */}
      <div className="flex-1 -mt-6 rounded-t-3xl bg-background z-10 relative px-5 pt-8 pb-6 flex flex-col">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
          <FiAlertTriangle size={26} className="text-orange-400" />
        </div>

        <h1 className="text-2xl font-bold text-brand-text-titles mb-2">Couldn't Identify</h1>
        <p className="text-brand-sub-text text-sm leading-relaxed mb-8">
          We couldn't identify the disease from this scan. Try from a closer angle with better lighting, or describe what you see with your voice.
        </p>

        <div className="space-y-3 mb-8">
          <Link
            href={ROUTES.SCAN}
            className="flex items-center justify-center gap-2 w-full rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95"
          >
            <FiRefreshCw size={18} />
            Try Another Scan
          </Link>
          <Link
            href={`${ROUTES.VOICE_DESCRIBE}${scanId ? `?scan_id=${scanId}` : ''}`}
            className="flex items-center justify-center gap-2 w-full rounded-brand bg-gray-100 border border-gray-200 py-4 text-gray-800 font-semibold text-base hover:bg-gray-200 transition active:scale-95"
          >
            Describe with Voice
          </Link>
        </div>

        {/* Expert CTA */}
        <div className="rounded-2xl bg-green-50 border border-green-100 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-buttons flex items-center justify-center shrink-0">
            <FiMessageCircle size={17} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-text-titles">Still having issues?</p>
            <p className="text-xs text-brand-sub-text mt-0.5 leading-relaxed">A certified expert can review your case.</p>
            <Link href={contactHref} className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary-green hover:underline">
              Get in touch with an expert →
            </Link>
          </div>
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
  const urgencyKey = (urgencyLabel.replace(' Urgency', '') as keyof typeof URGENCY) || 'Unknown';
  const urgencyStyle = URGENCY[urgencyKey] ?? URGENCY.Unknown;

  const confidence  = scan?.confidence_score != null ? Math.round(scan.confidence_score * 100) : null;
  const diseaseName = disease.name ?? 'Unknown Disease';
  const heroImage   = getDiseaseLocalImage(diseaseName);
  const symptoms    = disease.symptoms ?? disease.symtoms;
  const contactHref = scanId ? `${ROUTES.CONTACT}?scan_id=${scanId}` : ROUTES.CONTACT;

  // Only show treatment names (not descriptions) in the card list
  const treatmentNames = disease.treatments
    ?.map((t) => t.name)
    .filter((n): n is string => !!n);

  // Treatment detail descriptions for the expanded view
  const treatmentDetails = disease.treatments?.filter((t) => t.name && t.description) ?? [];

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">

      {/* ── Full-bleed hero image ─────────────────────────────────────── */}
      <div className="relative h-72 bg-gray-900 shrink-0">
        <Image
          src={heroImage}
          alt={diseaseName}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient overlay — helps text/button legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10" />

        {/* Back button */}
        <button
          type="button"
          onClick={() => router.replace(ROUTES.HOME)}
          aria-label="Go home"
          className="absolute top-12 left-5 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 shadow hover:bg-white transition"
        >
          <FiArrowLeft size={18} />
        </button>

        {/* Urgency pill */}
        <div className="absolute top-12 right-5">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${urgencyStyle.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${urgencyStyle.bar}`} />
            {urgencyLabel}
          </span>
        </div>

        {/* Confidence pill — bottom of image */}
        {confidence != null && (
          <div className="absolute bottom-5 left-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 shadow">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-green rounded-full"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700">{confidence}% match</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Sliding white detail card ──────────────────────────────────── */}
      <div className="-mt-6 rounded-t-3xl bg-background z-10 relative pb-10">

        {/* Disease name */}
        <div className="px-5 pt-7 pb-5">
          <h1 className="text-2xl font-bold text-brand-text-titles leading-snug">{diseaseName}</h1>
          {disease.disease_id && (
            <p className="text-xs text-brand-sub-text mt-1">Disease #{disease.disease_id}</p>
          )}
        </div>

        {/* ── Description ──────────────────────────────────────────────── */}
        {disease.description && (
          <section className="px-5 mb-5">
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-2">About</h2>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-card px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">{disease.description}</p>
            </div>
          </section>
        )}

        {/* ── Symptoms ─────────────────────────────────────────────────── */}
        {symptoms && (
          <section className="px-5 mb-5">
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-2">Symptoms</h2>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-card px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">{symptoms}</p>
            </div>
          </section>
        )}

        {/* ── Treatments ───────────────────────────────────────────────── */}
        {treatmentNames && treatmentNames.length > 0 && (
          <section className="px-5 mb-5">
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-2">Recommended Treatments</h2>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-card overflow-hidden">
              {treatmentDetails.length > 0 ? (
                treatmentDetails.map((t, i) => (
                  <div
                    key={i}
                    className={`px-5 py-4 ${i < treatmentDetails.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <FiCheckCircle size={13} className="text-primary-green" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                        {t.description && (
                          <p className="text-xs text-brand-sub-text mt-0.5 leading-relaxed">{t.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                treatmentNames.map((name, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-5 py-3.5 ${i < treatmentNames.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <FiCheckCircle size={15} className="text-primary-green shrink-0" />
                    <p className="text-sm text-gray-700">{name}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── Prevention tip ───────────────────────────────────────────── */}
        <div className="px-5 mb-5">
          <div className="rounded-2xl bg-brand-buttons/5 border border-brand-buttons/10 px-5 py-4 flex items-start gap-3">
            <FiShield size={18} className="text-brand-buttons mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Early detection prevents spread. Monitor adjacent plants and consult an expert if the condition worsens.
            </p>
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="px-5 space-y-3 mb-5">
          <Link
            href={ROUTES.SCAN}
            className="flex items-center justify-center gap-2 w-full rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95"
          >
            <FiRefreshCw size={18} />
            Scan Another Plant
          </Link>
        </div>

        {/* ── Expert CTA ───────────────────────────────────────────────── */}
        <ExpertCTA contactHref={contactHref} />
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
