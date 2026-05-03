/**
 * app/contact/page.tsx
 * Server Component — fetches experts list and user city server-side,
 * passes them as props to ContactClient.
 */
import AuthGuard from '@/components/AuthGuard';
import ContactClient from '@/components/pages/ContactClient';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Expert = {
  expert_id: number;
  first_name: string;
  last_name: string;
  specialization?: string;
  organization?: string;
  bio?: string;
  years_experienced?: number;
  rating?: number;
  location?: string;
  photo?: string | null;
  is_verified?: boolean;
};

async function getExperts(): Promise<Expert[]> {
  try {
    const payload = await serverApi<Expert[]>('/experts');
    const list = unwrapData<Expert[]>(payload as { data?: Expert[] }) ?? payload;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function getUserCity(): Promise<string | null> {
  try {
    const payload = await serverApi<Record<string, unknown>>('/users/me');
    const me = unwrapData<Record<string, unknown>>(payload as { data?: Record<string, unknown> }) ??
      (payload as Record<string, unknown>);
    return (typeof me?.city === 'string' ? me.city : null) ??
           (typeof me?.location === 'string' ? me.location : null);
  } catch {
    return null;
  }
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ scan_id?: string }>;
}) {
  const { scan_id } = await searchParams;

  // Run both fetches in parallel — independent of each other
  const [experts, userCity] = await Promise.all([getExperts(), getUserCity()]);

  return (
    <AuthGuard type="protected">
      <ContactClient experts={experts} userCity={userCity} scanId={scan_id} />
    </AuthGuard>
  );
}
