/**
 * app/expert/profile/help/page.tsx
 * Expert settings: Help
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { EXPERT_COOKIE_NAME, EXPERT_ID_COOKIE, EXPERT_ROUTES } from '@/lib/constants';
import HelpClient from '@/components/pages/settings/HelpClient';
import ExpertNavbar from '@/components/expert/ExpertNavbar';

export const dynamic = 'force-dynamic';

export default async function ExpertHelpPage() {
  const jar      = await cookies();
  const token    = jar.get(EXPERT_COOKIE_NAME)?.value;
  const expertId = jar.get(EXPERT_ID_COOKIE)?.value;
  if (!token || !expertId) redirect(EXPERT_ROUTES.LOGIN);

  return (
    <>
      <HelpClient backHref={EXPERT_ROUTES.PROFILE} />
      <ExpertNavbar />
    </>
  );
}
