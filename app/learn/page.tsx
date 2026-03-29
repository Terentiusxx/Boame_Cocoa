import Link from "next/link";
import { serverApi } from "@/lib/serverAPI";

type WithData<T> = { data: T };

type DiseaseListItem = {
  disease_id: number;
  name: string;
  urgency_level?: string;
};

type LearnDiseaseCard = {
  key: string;
  diseaseId: number;
  name: string;
  description: string;
  urgencyLabel: "High Urgency" | "Medium Urgency";
  urgencyClass: string;
  imageUrl: string;
};

type TopicCard = {
  title: string;
  imageUrl: string;
};

const DISEASE_COPY: Record<
  string,
  {
    canonicalName: string;
    description: string;
    fallbackUrgency: "high" | "medium";
    imageUrl: string;
    aliases: string[];
  }
> = {
  black_pod_disease: {
    canonicalName: "Black Pod Disease",
    description: "Fungal infection causing pod rot and dark lesions.",
    fallbackUrgency: "high",
    imageUrl: "/img/blackpod_d.png",
    aliases: ["black pod", "blackpod"],
  },
  ccsv_disease: {
    canonicalName: "CCSV Disease",
    description: "Virus causing leaf redness and stem swelling.",
    fallbackUrgency: "high",
    imageUrl: "/img/ccsv_d.png",
    aliases: ["ccsv", "cssvd", "swollen shoot", "cocoa swollen shoot"],
  },
  witches_broom: {
    canonicalName: "Witches' Broom",
    description: "Abnormal broom-like shoots forming at branch tips.",
    fallbackUrgency: "medium",
    imageUrl: "/img/witches_d.png",
    aliases: ["witches broom", "witches' broom"],
  },
  frosty_pod_rot: {
    canonicalName: "Frosty Pod Rot",
    description: "White fungal growth covering pods like frost.",
    fallbackUrgency: "medium",
    imageUrl: "/img/frosty_d.png",
    aliases: ["frosty pod", "frosty pod rot"],
  },
  vsd_disease: {
    canonicalName: "VSD Disease",
    description: "Yellowing leaf edges with brown streaks along veins.",
    fallbackUrgency: "medium",
    imageUrl: "/img/vsd_d.png",
    aliases: ["vsd", "vascular streak", "streak dieback"],
  },
  pest_damage: {
    canonicalName: "Pest Damage",
    description: "Small black pod spots from insect feeding activity.",
    fallbackUrgency: "medium",
    imageUrl: "/img/pest_d.png",
    aliases: ["pest", "pest damage", "insect"],
  },
};

const DISEASE_ORDER = [
  "black_pod_disease",
  "ccsv_disease",
  "witches_broom",
  "frosty_pod_rot",
  "vsd_disease",
  "pest_damage",
] as const;

const LEARN_TOPIC_CARDS: TopicCard[] = [
  { title: "Cocoa Growth & Care", imageUrl: "/img/homelogo.png" },
  { title: "Watering & Soil Health", imageUrl: "/img/backdrop.png" },
  { title: "Harvest & Post-Harvest", imageUrl: "/img/scan-leaf.png" },
  { title: "Benefits & Sustainability", imageUrl: "/img/unknown.png" },
];

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in (value as any)) {
    const data = (value as WithData<unknown>).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

async function getDiseases(): Promise<DiseaseListItem[]> {
  try {
    const payload = await serverApi<unknown>(`/diseases/?limit=6`);
    return unwrapArray<DiseaseListItem>(payload);
  } catch {
    return [];
  }
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function resolveDiseaseKey(name: string): keyof typeof DISEASE_COPY | null {
  const normalized = normalizeName(name);

  for (const key of DISEASE_ORDER) {
    const entry = DISEASE_COPY[key];
    const candidates = [entry.canonicalName, ...entry.aliases];
    if (candidates.some((candidate) => normalized.includes(normalizeName(candidate)))) {
      return key;
    }
  }

  return null;
}

function toUrgency(urgency: string | undefined, fallback: "high" | "medium") {
  const value = (urgency || fallback).toLowerCase();
  if (value === "high") {
    return { urgencyLabel: "High Urgency" as const, urgencyClass: "bg-urgency-high" };
  }
  return { urgencyLabel: "Medium Urgency" as const, urgencyClass: "bg-urgency-medium" };
}

function buildDiseaseCards(items: DiseaseListItem[]): LearnDiseaseCard[] {
  const matchedByKey = new Map<keyof typeof DISEASE_COPY, DiseaseListItem>();

  for (const item of items) {
    const key = resolveDiseaseKey(item.name);
    if (key && !matchedByKey.has(key)) {
      matchedByKey.set(key, item);
    }
  }

  return DISEASE_ORDER.map((key, index) => {
    const entry = DISEASE_COPY[key];
    const matched = matchedByKey.get(key);
    const urgency = toUrgency(matched?.urgency_level, entry.fallbackUrgency);

    return {
      key,
      diseaseId: matched?.disease_id ?? index + 1,
      name: entry.canonicalName,
      description: entry.description,
      urgencyLabel: urgency.urgencyLabel,
      urgencyClass: urgency.urgencyClass,
      imageUrl: entry.imageUrl,
    };
  });
}


export default async function Learn() {
  const diseases = await getDiseases();
  const diseaseCards = buildDiseaseCards(diseases);

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      
      <div className="px-5 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6">
          <Link
            href="/home"
            className="bg-gray-100 border-none text-lg cursor-pointer rounded-full flex items-center justify-center w-12 h-12 hover:bg-gray-200"
            aria-label="Go back"
          >
            <span className="text-3xl leading-none text-gray-700">&#8249;</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Learn</h1>
          <div className="w-12"></div>
        </div>
        
        <h2 className="text-base font-semibold text-brand-text-titles mb-5">Learn About Cocoa Diseases</h2>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 mb-10">
          {diseaseCards.map((disease) => (
            <Link
              key={disease.key}
              href={`/learn/${disease.diseaseId}`}
              className="flex flex-col items-center text-center bg-white rounded-3xl p-4 h-full hover:shadow-lg transition-shadow"
            >
              <img
                src={disease.imageUrl}
                alt={disease.name}
                width={96}
                height={96}
                className="object-contain w-[96px] h-[96px] mb-2"
              />
              <h3 className="text-[17px] leading-tight font-semibold text-brand-text-titles mb-2 min-h-[42px] flex items-center justify-center">
                {disease.name}
              </h3>
              <p className="text-brand-sub-text text-[12px] leading-tight mb-3 min-h-[52px] max-w-[132px] mx-auto">
                {disease.description}
              </p>
              <span
                className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-white text-[12px] font-medium leading-none ${disease.urgencyClass}`}
              >
                {disease.urgencyLabel}
              </span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pb-20">
          {LEARN_TOPIC_CARDS.map((topic) => (
            <div
              key={topic.title}
              className="bg-white rounded-3xl p-3 h-28 flex items-center justify-between gap-3"
            >
              <p className="text-brand-text-titles text-[14px] font-medium leading-snug max-w-[95px]">
                {topic.title}
              </p>
              <img
                src={topic.imageUrl}
                alt={topic.title}
                width={70}
                height={70}
                className="object-contain w-[70px] h-[70px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
