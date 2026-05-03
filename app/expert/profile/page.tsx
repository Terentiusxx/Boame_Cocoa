/**
 * app/expert/profile/page.tsx
 * Server Component — expert Settings hub.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, EXPERT_ROUTES } from '@/lib/constants';
import ExpertSettingsClient from '@/components/expert/ExpertSettingsClient';

export const dynamic = 'force-dynamic';

export default async function ExpertProfilePage() {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;
  if (!token || !expertId) redirect(EXPERT_ROUTES.LOGIN);

  return <ExpertSettingsClient />;
}
