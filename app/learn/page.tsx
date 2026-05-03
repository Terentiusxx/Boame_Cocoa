/**
 * app/learn/page.tsx
 * Server Component — fetches diseases from the backend and renders the
 * Learn page with disease cards and topic tiles.
 */
import Link from 'next/link';
import { serverApi } from '@/lib/serverAPI';
import AuthGuard from '@/components/AuthGuard';

type DiseaseListItem = {
  disease_id: number;
  name: string;
  urgency_level?: string;
};

// Static copy so the page works even if the backend returns nothing
const DISEASE_COPY: Record<string, {
  slug: string;
  description: string;
  fallbackUrgency: string;
  imageUrl: string;
  aliases: string[];
}> = {
  black_pod:    { slug: 'black_pod',    description: 'Fungal infection causing pod rot and dark lesions spreading rapidly.', fallbackUrgency: 'high',   imageUrl: '/img/blackpod_d.png',  aliases: ['black pod', 'blackpod'] },
  ccsv:         { slug: 'ccsv',         description: 'Virus causing leaf redness, yellow streaks, and stem swelling.',       fallbackUrgency: 'high',   imageUrl: '/img/ccsv_d.png',      aliases: ['ccsv', 'cssvd', 'swollen shoot'] },
  witches_broom:{ slug: 'witches_broom',description: 'Abnormal broom-like shoot clusters forming at branch tips.',           fallbackUrgency: 'medium', imageUrl: '/img/witches_d.png',   aliases: ['witches broom', "witches' broom"] },
  frosty_pod:   { slug: 'frosty_pod',   description: 'White fungal growth covering pods resembling frost or snow.',          fallbackUrgency: 'medium', imageUrl: '/img/frosty_d.png',    aliases: ['frosty pod', 'frosty pod rot'] },
  vsd:          { slug: 'vsd',          description: 'Yellowing leaf edges and brown streaks along the vascular tissue.',    fallbackUrgency: 'medium', imageUrl: '/img/vsd_d.png',       aliases: ['vsd', 'vascular streak'] },
  pest_damage:  { slug: 'pest_damage',  description: 'Small black spots on pods caused by insect feeding and boring.',       fallbackUrgency: 'medium', imageUrl: '/img/pest_d.png',      aliases: ['pest', 'pest damage', 'insect'] },
};

const DISPLAY_NAMES: Record<string, string> = {
  black_pod:    'Black Pod Disease',
  ccsv:         'CCSV Disease',
  witches_broom:"Witches' Broom",
  frosty_pod:   'Frosty Pod Rot',
  vsd:          'VSD Disease',
  pest_damage:  'Pest Damage',
};

const SLUG_ORDER = ['black_pod','ccsv','witches_broom','frosty_pod','vsd','pest_damage'] as const;

function normalize(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

function matchSlug(name: string): typeof SLUG_ORDER[number] | null {
  const n = normalize(name);
  for (const slug of SLUG_ORDER) {
    const entry = DISEASE_COPY[slug]!;
    if ([slug, ...entry.aliases].some((a) => n.includes(normalize(a)))) return slug;
  }
  return null;
}

const URGENCY_STYLE: Record<string, { badge: string; dot: string }> = {
  high:   { badge: 'bg-red-50 text-red-700 border-red-200',    dot: 'bg-red-500' },
  medium: { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  low:    { badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
};

async function getDiseases() {
  try {
    const payload = await serverApi<DiseaseListItem[] | { data?: DiseaseListItem[] }>('/diseases/?limit=6');
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { data?: DiseaseListItem[] }).data)
      ? (payload as { data: DiseaseListItem[] }).data
      : [];
    return list as DiseaseListItem[];
  } catch { return []; }
}

export default async function LearnPage() {
  const diseases  = await getDiseases();
  const bySlug    = new Map<string, DiseaseListItem>();
  for (const d of diseases) {
    const slug = matchSlug(d.name);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, d);
  }

  return (
    <AuthGuard type="protected">
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
        <div className="px-5 pb-24">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-12 pb-6">
            <Link href={ROUTES_HOME} aria-label="Back"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Learn</h1>
            <div className="w-9" />
          </div>

          {/* Section label */}
          <h2 className="text-base font-semibold text-gray-800 mb-4">Cocoa Diseases</h2>

          {/* Disease grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {SLUG_ORDER.map((slug) => {
              const entry   = DISEASE_COPY[slug]!;
              const matched = bySlug.get(slug);
              const urgency = (matched?.urgency_level ?? entry.fallbackUrgency).toLowerCase();
              const style   = URGENCY_STYLE[urgency] ?? URGENCY_STYLE.medium!;
              const diseaseId = matched?.disease_id ?? 1;

              return (
                <Link
                  key={slug}
                  href={`/learn/${diseaseId}`}
                  className="group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                >
                  {/* Image */}
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.imageUrl} alt={DISPLAY_NAMES[slug] ?? slug} className="w-full h-full object-cover" />
                  </div>

                  {/* Name */}
                  <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-primary-green transition-colors">
                    {DISPLAY_NAMES[slug] ?? slug}
                  </p>

                  {/* Description */}
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 flex-1">
                    {entry.description}
                  </p>

                  {/* Urgency pill */}
                  <span className={`self-start rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                    {urgency === 'high' ? 'High Risk' : urgency === 'medium' ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Learning topics section */}
          <h2 className="text-base font-semibold text-gray-800 mb-4">Cocoa Farming Tips</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Growth & Care',          img: '/img/homelogo.png'  },
              { title: 'Watering & Soil Health', img: '/img/backdrop.png'  },
              { title: 'Harvest & Post-Harvest', img: '/img/scan-leaf.png' },
              { title: 'Sustainability',          img: '/img/unknown.png'   },
            ].map((topic) => (
              <div
                key={topic.title}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-2 h-20"
              >
                <p className="text-sm font-semibold text-gray-800 leading-snug flex-1">{topic.title}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={topic.img} alt={topic.title} className="w-12 h-12 object-contain shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

const ROUTES_HOME = '/home';
