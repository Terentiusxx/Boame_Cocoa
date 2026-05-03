/**
 * app/learn/[disease_id]/page.tsx
 * Individual disease detail page — server-rendered, rich content layout.
 */
import Link from 'next/link';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData, urgencyToUi } from '@/lib/utils';
import AuthGuard from '@/components/AuthGuard';
import { ROUTES } from '@/lib/constants';

type DiseaseDetail = {
  disease_id?: number;
  name?: string;
  description?: string;
  urgency_level?: string;
  symtoms?: string;
  symptoms?: string;
  image_url?: string;
  icon_name?: string;
  treatments?: { name?: string; description?: string }[];
};

const URGENCY_CONFIG: Record<string, {
  heroGradient: string;
  bar: string;
  badge: string;
  dot: string;
  textClass: string;
}> = {
  High:    { heroGradient: 'from-red-500 to-rose-600',     bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',     dot: 'bg-red-500',    textClass: 'text-red-700' },
  Medium:  { heroGradient: 'from-yellow-400 to-orange-500', bar: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', textClass: 'text-yellow-700' },
  Low:     { heroGradient: 'from-green-400 to-emerald-600', bar: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500',  textClass: 'text-green-700' },
  Unknown: { heroGradient: 'from-gray-400 to-gray-600',     bar: 'bg-gray-400',   badge: 'bg-gray-50 text-gray-600 border-gray-200',   dot: 'bg-gray-400',   textClass: 'text-gray-500' },
};

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

export default async function LearnDiseasePage({
  params,
}: {
  params: Promise<{ disease_id: string }>;
}) {
  const { disease_id } = await params;
  const id = Number(disease_id);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <AuthGuard type="protected">
        <NotFound />
      </AuthGuard>
    );
  }

  let disease: DiseaseDetail | null = null;
  try {
    const payload = await serverApi<DiseaseDetail>(`/diseases/${id}`);
    disease = unwrapData<DiseaseDetail>(payload as { data?: DiseaseDetail }) ?? (payload as DiseaseDetail) ?? null;
  } catch {
    disease = null;
  }

  if (!disease) {
    return (
      <AuthGuard type="protected">
        <NotFound />
      </AuthGuard>
    );
  }

  const { label: urgencyLabel } = urgencyToUi(disease.urgency_level);
  const urgencyKey = (urgencyLabel.replace(' Urgency', '').replace(' Risk', '') as keyof typeof URGENCY_CONFIG) || 'Unknown';
  const style      = URGENCY_CONFIG[urgencyKey] ?? URGENCY_CONFIG.Unknown!;
  const name       = disease.name ?? 'Disease';
  const symptoms   = disease.symptoms ?? disease.symtoms;
  const treatments = disease.treatments?.map((t) => ({ name: t.name, desc: t.description })).filter((t) => t.name);

  return (
    <AuthGuard type="protected">
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">

        {/* Urgency colour top bar */}
        <div className={`h-1.5 w-full ${style.bar}`} />

        {/* ── Hero section ─────────────────────────────────────────────── */}
        <div className={`bg-gradient-to-br ${style.heroGradient} px-6 pt-8 pb-8 relative overflow-hidden`}>
          {/* Background decorative shapes */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/2" />

          {/* Back button */}
          <Link href="/learn" aria-label="Back to Learn"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition mb-6">
            <BackArrow />
          </Link>

          {/* Disease image */}
          {disease.image_url && (
            <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white/20 mb-5 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={disease.image_url} alt={name} className="w-full h-full object-cover" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-white mb-3 leading-tight">{name}</h1>

          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}>
            {urgencyLabel}
          </span>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="px-5 py-6 space-y-4 pb-12">

          {/* About */}
          {disease.description && (
            <Section title="About This Disease">
              <p className="text-sm text-gray-600 leading-relaxed">{disease.description}</p>
            </Section>
          )}

          {/* Symptoms */}
          {symptoms && (
            <Section title="Symptoms to Look For">
              <p className="text-sm text-gray-600 leading-relaxed">{symptoms}</p>
            </Section>
          )}

          {/* Treatments */}
          {treatments && treatments.length > 0 && (
            <Section title="Recommended Treatment">
              <div className="space-y-3">
                {treatments.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                      {t.desc && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{t.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* CTA */}
          <div className="pt-2 space-y-3">
            <Link
              href={`${ROUTES.CONTACT}?disease=${id}`}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95"
            >
              Talk to a Specialist
            </Link>
            <Link
              href={ROUTES.SCAN}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gray-100 py-4 text-gray-900 font-semibold text-base hover:bg-gray-200 transition active:scale-95"
            >
              Scan My Cocoa
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{title}</h2>
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4">
        {children}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background shadow-mobile flex flex-col items-center justify-center px-8 text-center">
      <p className="text-gray-500 mb-4">Disease information not found.</p>
      <Link href="/learn"
        className="rounded-2xl bg-brand-buttons px-8 py-3 text-white font-semibold text-sm hover:opacity-90 transition">
        ← Back to Learn
      </Link>
    </div>
  );
}
