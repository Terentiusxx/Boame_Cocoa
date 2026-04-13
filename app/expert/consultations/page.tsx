/**
 * app/expert/consultations/page.tsx
 * Server Component — fetches all expert consultations server-side.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EXPERT_COOKIE_NAME, EXPERT_ROUTES } from '@/lib/constants';
import ExpertConsultationsClient from '@/components/expert/ExpertConsultationsClient';

export const dynamic = 'force-dynamic';

type Consultation = {
  consult_id: number; user_id: number; scan_id?: number; expert_id: number;
  subject: string; description?: string; priority: string;
  status: string; created_at: string; updated_at: string; resolution_note?: string;
};

export default async function ExpertConsultationsPage() {
  const jar   = await cookies();
  const token = jar.get(EXPERT_COOKIE_NAME)?.value;
  if (!token) redirect(EXPERT_ROUTES.LOGIN);

  let consultations: Consultation[] = [];
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
    const res  = await fetch(`${base}/experts/consultations/my`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json() as { data?: Consultation[] } | Consultation[];
      const list = Array.isArray(data) ? data : Array.isArray((data as { data?: Consultation[] }).data) ? (data as { data: Consultation[] }).data : [];
      consultations = list;
    }
  } catch { /* show empty state */ }

  return <ExpertConsultationsClient consultations={consultations} />;
}
