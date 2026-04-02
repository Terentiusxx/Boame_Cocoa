import HomeUI from '@/components/homeui'
import AuthGuard from '@/components/AuthGuard'
import { serverApi } from '@/lib/serverAPI'
import type { DiseaseData, HistoryResponse } from '@/lib/types'
import { getDiseaseLocalImage } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type WithData<T> = { data: T }
type MaybeWrapped<T> = T | WithData<T>

function unwrap<T>(value: MaybeWrapped<T>): T {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as WithData<T>).data
  }
  return value as T
}

function urgencyToUi(urgencyLevel?: string) {
  const v = urgencyLevel?.toLowerCase()
  if (v === 'high') return { urgency: 'High Urgency', urgencyClass: 'urgency-high' }
  if (v === 'medium') return { urgency: 'Medium Urgency', urgencyClass: 'urgency-medium' }
  if (v === 'low') return { urgency: 'Low Urgency', urgencyClass: 'urgency-low' }
  return { urgency: 'Unknown', urgencyClass: 'urgency-low' }
}

async function getUserId() {
  try {
    const dash = await serverApi<any>('/users/dashboard')
    return (
      dash?.user_id ??
      dash?.id ??
      dash?.data?.user_id ??
      dash?.data?.id ??
      dash?.user?.user_id ??
      dash?.user?.id ??
      null
    )
  } catch {
    return null
  }
}

async function getRecentScans(limit: number): Promise<DiseaseData[]> {
  const userId = await getUserId()
  if (!userId) return []

  let scans: HistoryResponse['scans'] = []
  try {
    const history = unwrap(await serverApi<MaybeWrapped<HistoryResponse>>(`/history/${userId}?limit=${limit}`))
    scans = history?.scans ?? []
  } catch {
    return []
  }

  return scans.map((scan) => {
    const u = urgencyToUi(scan.urgency_level)
    return {
      id: String(scan.scan_id),
      name: scan.disease_name,
      urgency: u.urgency as DiseaseData['urgency'],
      urgencyClass: u.urgencyClass,
      image: getDiseaseLocalImage(scan.disease_name),
    }
  })
}

async function getFirstName(): Promise<string | null> {
  try {
    const me = await serverApi<any>('/users/me')
    const user = unwrap<any>(me)
    return typeof user?.first_name === 'string' && user.first_name.trim()
      ? user.first_name.trim()
      : null
  } catch {
    return null
  }
}

export default async function Page() {
  const [recentScans, firstName] = await Promise.all([getRecentScans(3), getFirstName()])
  return (
    <AuthGuard type="protected">
      <HomeUI recentScans={recentScans} firstName={firstName} />
    </AuthGuard>
  )
}