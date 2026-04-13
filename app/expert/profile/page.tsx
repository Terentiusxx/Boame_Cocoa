/**
 * app/expert/profile/page.tsx
 * Server Component — fetches expert's own profile server-side.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, EXPERT_ROUTES } from '@/lib/constants';
import ExpertProfileClient from '@/components/expert/ExpertProfileClient';

export const dynamic = 'force-dynamic';

type ExpertProfile = {
  expert_id: number; first_name: string; mid_name?: string; last_name: string;
  email: string; telephone?: string; specialization?: string; organization?: string;
  bio?: string; years_experienced?: number; license_id?: string; is_verified?: boolean;
  rating?: number; image_url?: string; city?: string; region?: string; country?: string;
};

export default async function ExpertProfilePage() {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;
  if (!token || !expertId) redirect(EXPERT_ROUTES.LOGIN);

  let profile: ExpertProfile | null = null;
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
    const res  = await fetch(`${base}/experts/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json() as { data?: ExpertProfile } | ExpertProfile;
      profile = (data as { data?: ExpertProfile })?.data ?? (data as ExpertProfile) ?? null;
    }
  } catch { /* show form with empty values */ }

  return <ExpertProfileClient initialProfile={profile} expertId={Number(expertId)} />;
}
