import SignUpClient from '@/components/pages/SignUpClient';
import AuthGuard from '@/components/AuthGuard';

export default function SignUpPage() {
  return (
    <AuthGuard type="public">
      <SignUpClient />
    </AuthGuard>
  );
}
