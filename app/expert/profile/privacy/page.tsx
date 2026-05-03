/**
 * app/expert/profile/privacy/page.tsx
 * Expert settings: Privacy
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, EXPERT_ROUTES } from '@/lib/constants';
import PrivacyClient from '@/components/pages/settings/PrivacyClient';
import ExpertNavbar from '@/components/expert/ExpertNavbar';

export const dynamic = 'force-dynamic';

export default async function ExpertPrivacyPage() {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;
  if (!token || !expertId) redirect(EXPERT_ROUTES.LOGIN);

  return (
    <>
      <PrivacyClient backHref={EXPERT_ROUTES.PROFILE} />
      <ExpertNavbar />
    </>
  );
}
