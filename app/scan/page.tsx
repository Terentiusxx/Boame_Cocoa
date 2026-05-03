import ScanClient from '@/components/pages/ScanClient';
import AuthGuard from '@/components/AuthGuard';

export default function ScanPage() {
  return (
    <AuthGuard type="protected">
      <ScanClient />
    </AuthGuard>
  );
}
