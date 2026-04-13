/**
 * app/expert/dashboard/page.tsx
 * Server Component — fetches expert dashboard stats + profile server-side.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, EXPERT_ROUTES } from '@/lib/constants';
import ExpertDashboardClient from '@/components/expert/ExpertDashboardClient';

export const dynamic = 'force-dynamic';

function getBackendUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
}

async function safeFetch<T>(url: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json() as { data?: T } | T;
    return ((data as { data?: T })?.data ?? data) as T;
  } catch { return null; }
}

type ExpertProfile = {
  expert_id: number; first_name: string; last_name: string;
  email: string; specialization?: string; organization?: string;
  bio?: string; years_experienced?: number; rating?: number;
  is_verified?: boolean; image_url?: string; city?: string; country?: string;
};

type DashboardData = Record<string, unknown>;

export default async function ExpertDashboardPage() {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;

  // Server-side guard — redirect if not authenticated
  if (!token || !expertId) redirect(EXPERT_ROUTES.LOGIN);

  const base = getBackendUrl();
  const [profile, dashboard] = await Promise.all([
    safeFetch<ExpertProfile>(`${base}/experts/profile/me`, token),
    safeFetch<DashboardData>(`${base}/experts/dashboard`, token),
  ]);

  return <ExpertDashboardClient profile={profile} dashboard={dashboard} />;
}
