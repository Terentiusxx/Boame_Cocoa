import VoiceDescribeClient from '@/components/pages/VoiceDescribeClient';
import AuthGuard from '@/components/AuthGuard';

export default function VoiceDescribePage() {
  return (
    <AuthGuard type="protected">
      <VoiceDescribeClient />
    </AuthGuard>
  );
}
