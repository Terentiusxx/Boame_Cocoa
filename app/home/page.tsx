/**
 * app/home/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Server Component — fetches home page data server-side and passes
 * it as props to HomeUI (a Client Component).
 *
 * Runs on every request (force-dynamic) so data is always fresh.
 * Any errors are caught individually so a partial failure (e.g. /users/me
 * fails) doesn't crash the whole page.
 */
import HomeUI from '@/components/homeui';
import AuthGuard from '@/components/AuthGuard';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData, urgencyToUi, getDiseaseLocalImage } from '@/lib/utils';
import type { DiseaseData, HistoryResponse } from '@/lib/types';

// Force dynamic so cookies are available and data is fresh per request
export const dynamic = 'force-dynamic';

// ─── Server-Side Data Fetching ────────────────────────────────────────────────

/** Fetch the current user's first name. Returns null on any failure. */
async function getFirstName(): Promise<string | null> {
  try {
    const me = unwrapData(await serverApi<Record<string, unknown>>('/users/me')) ??
               await serverApi<Record<string, unknown>>('/users/me');
    return typeof me?.first_name === 'string' && me.first_name.trim()
      ? me.first_name.trim()
      : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the authenticated user's ID from the dashboard.
 * The dashboard response reliably includes user_id.
 */
async function getUserId(): Promise<number | null> {
  try {
    const dash = await serverApi<Record<string, unknown>>('/users/dashboard');
    const data = unwrapData<Record<string, unknown>>(dash as { data?: Record<string, unknown> }) ?? (dash as Record<string, unknown>);
    const id = data?.user_id ?? data?.id ??
      (data?.user as Record<string, unknown> | undefined)?.user_id;
    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

/** Fetch recent scan history and map to DiseaseData for the home page */
async function getRecentScans(limit = 3): Promise<DiseaseData[]> {
  try {
    const history = unwrapData(
      await serverApi<{ scans?: HistoryResponse['scans'] }>(`/history/me?limit=${limit}`)
    );
    const scans = (history as HistoryResponse | null)?.scans ?? [];

    return scans.map((scan) => {
      const { label, className } = urgencyToUi(scan.urgency_level);
      return {
        id:           String(scan.scan_id),
        name:         scan.disease_name,
        urgency:      label as DiseaseData['urgency'],
        urgencyClass: className,
        image:        getDiseaseLocalImage(scan.disease_name),
      };
    });
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch data in parallel — individual failures return fallback values
  const [recentScans, firstName] = await Promise.all([
    getRecentScans(3),
    getFirstName(),
  ]);

  return (
    <AuthGuard type="protected">
      <HomeUI recentScans={recentScans} firstName={firstName} />
    </AuthGuard>
  );
}