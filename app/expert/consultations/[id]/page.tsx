/**
 * app/expert/consultations/[id]/page.tsx
 * Server Component — fetches single consultation detail.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EXPERT_COOKIE_NAME, EXPERT_ROUTES } from '@/lib/constants';
import ExpertConsultationDetailClient from '@/components/expert/ExpertConsultationDetailClient';

export const dynamic = 'force-dynamic';

type ConsultDetail = {
  consult_id: number; user_id: number; scan_id?: number; expert_id: number;
  subject: string; description?: string; priority: string;
  status: string; created_at: string; updated_at: string; resolution_note?: string;
};

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const jar     = await cookies();
  const token   = jar.get(EXPERT_COOKIE_NAME)?.value;
  if (!token) redirect(EXPERT_ROUTES.LOGIN);

  let consultation: ConsultDetail | null = null;
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
    const res  = await fetch(`${base}/experts/consultations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json() as { data?: ConsultDetail } | ConsultDetail;
      consultation = (data as { data?: ConsultDetail })?.data ?? (data as ConsultDetail) ?? null;
    }
  } catch { /* show error state */ }

  return <ExpertConsultationDetailClient consultation={consultation} consultId={id} />;
}
