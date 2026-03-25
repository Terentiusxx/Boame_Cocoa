import Link from 'next/link'

import { serverApi } from '@/lib/serverAPI'

type WithData<T> = { data: T }

type DiseaseOut = {
  disease_id?: number
  name?: string
  description?: string
  urgency_level?: string
  symtoms?: string
  image_url?: string
  icon_name?: string
  color_hex?: string
}

function unwrap<T>(value: unknown): T | null {
  if (value && typeof value === 'object' && 'data' in (value as any)) {
    return ((value as WithData<T>).data ?? null) as T | null
  }
  return (value ?? null) as T | null
}

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  )
}

function urgencyLabel(value?: string) {
  const v = (value || '').toLowerCase()
  if (v === 'high') return 'High Urgency'
  if (v === 'medium') return 'Medium Urgency'
  if (v === 'low') return 'Low Urgency'
  return value || 'Unknown'
}

function urgencyTextClass(value?: string) {
  const v = (value || '').toLowerCase()
  if (v === 'high') return 'text-urgency-high'
  if (v === 'medium') return 'text-urgency-medium'
  if (v === 'low') return 'text-urgency-low'
  return 'text-gray-700'
}

export default async function LearnDiseasePage({
  params,
}: {
  params: Promise<{ disease_id: string }> | { disease_id: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const diseaseIdRaw = resolvedParams.disease_id
  const diseaseId = Number(diseaseIdRaw)

  if (!Number.isFinite(diseaseId) || diseaseId <= 0) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
        <StatusBar />
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between py-4 mb-6">
            <Link
              href="/learn"
              className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
            >
              <span className="text-xl">‹</span>
            </Link>
            <h1 className="text-xl font-semibold text-brand-text-titles">Learn</h1>
            <div className="w-9"></div>
          </div>

          <p className="text-brand-sub-text">Disease not found.</p>
        </div>
      </div>
    )
  }

  let disease: DiseaseOut | null = null
  try {
    const payload = await serverApi<unknown>(`/diseases/${diseaseId}`)
    disease = unwrap<DiseaseOut>(payload)
  } catch {
    disease = null
  }

  const name = disease?.name || 'Disease'
  const icon = disease?.icon_name || '🌿'
  const urgency = urgencyLabel(disease?.urgency_level)

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between py-4 mb-6">
          <Link
            href="/learn"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Learn</h1>
          <div className="w-9"></div>
        </div>

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{icon}</span>
          </div>

          <h2 className="text-2xl font-bold text-brand-text-titles mb-2">{name}</h2>
          <p className={`${urgencyTextClass(disease?.urgency_level)} text-lg font-semibold mb-4`}>{urgency}</p>
        </div>

        {disease?.image_url ? (
          <div className="bg-white rounded-brand p-4 shadow-card border border-gray-100 mb-6">
            <img
              src={disease.image_url}
              alt={name}
              className="w-full h-48 object-contain"
              loading="lazy"
            />
          </div>
        ) : null}

        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-brand-sub-titles mb-2">What you should know</h3>
          <p className="text-brand-sub-text font-normal text-sm leading-relaxed mb-4">
            {disease?.description || 'No description available yet.'}
          </p>

          <h3 className="font-semibold text-brand-sub-titles mb-2">Symptoms</h3>
          <p className="text-brand-sub-text font-normal text-sm leading-relaxed">
            {disease?.symtoms || 'No symptoms information available yet.'}
          </p>
        </div>
      </div>
    </div>
  )
}
