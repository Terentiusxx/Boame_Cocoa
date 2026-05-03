/**
 * app/contact/form/page.tsx
 * Server Component — fetches the expert's details server-side,
 * passes them as props to ContactFormClient.
 */
import AuthGuard from '@/components/AuthGuard';
import ContactFormClient from '@/components/pages/ContactFormClient';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Expert = {
  expert_id: number;
  first_name: string;
  last_name: string;
  specialization?: string;
};

async function getExpert(expertId: string): Promise<Expert | null> {
  const id = Number(expertId);
  if (!Number.isFinite(id) || id <= 0) return null;
  try {
    const payload = await serverApi<Expert>(`/experts/${id}`);
    return unwrapData<Expert>(payload as { data?: Expert }) ?? (payload as Expert) ?? null;
  } catch {
    return null;
  }
}

export default async function ContactFormPage({
  searchParams,
}: {
  searchParams: Promise<{ expert_id?: string; scan_id?: string }>;
}) {
  const { expert_id, scan_id } = await searchParams;

  // Fetch expert details server-side — ContactFormClient only handles the POST
  const expert = expert_id ? await getExpert(expert_id) : null;

  return (
    <AuthGuard type="protected">
      <ContactFormClient expert={expert} expertId={expert_id} scanId={scan_id} />
    </AuthGuard>
  );
}
