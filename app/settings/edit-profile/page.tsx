/**
 * app/settings/edit-profile/page.tsx
 * Server Component — fetches user profile data and passes it as props
 * to EditProfileClient. All GET requests stay on the server.
 */
import EditProfileClient from '@/components/pages/settings/EditProfileClient';
import AuthGuard from '@/components/AuthGuard';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type UserProfile = {
  first_name?: string;
  mid_name?: string;
  last_name?: string;
  email?: string;
  telephone?: string;
  role?: string;
};

async function getProfile(): Promise<UserProfile | null> {
  try {
    const payload = await serverApi<UserProfile>('/users/me');
    return unwrapData<UserProfile>(payload as { data?: UserProfile }) ?? (payload as UserProfile) ?? null;
  } catch {
    return null;
  }
}

export default async function EditProfilePage() {
  const profile = await getProfile();

  return (
    <AuthGuard type="protected">
      <EditProfileClient initialProfile={profile} />
    </AuthGuard>
  );
}
