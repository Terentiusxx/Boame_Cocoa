import CreateAccountClient from '@/components/pages/CreateAccountClient';
import AuthGuard from '@/components/AuthGuard';

export default function CreateAccountPage() {
  return (
    <AuthGuard type="public">
      <CreateAccountClient />
    </AuthGuard>
  );
}
