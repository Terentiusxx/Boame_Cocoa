import ProcessingClient from '@/components/pages/ProcessingClient';
import AuthGuard from '@/components/AuthGuard';

export default function ProcessingPage() {
  return (
    <AuthGuard type="protected">
      <ProcessingClient />
    </AuthGuard>
  );
}
