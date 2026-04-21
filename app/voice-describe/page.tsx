import VoiceDescribeClient from '@/components/pages/VoiceDescribeClient';
import AuthGuard from '@/components/AuthGuard';

interface Props {
  searchParams: Promise<{ scan_id?: string }>;
}

export default async function VoiceDescribePage({ searchParams }: Props) {
  const { scan_id } = await searchParams;

  return (
    <AuthGuard type="protected">
      <VoiceDescribeClient scanId={scan_id} />
    </AuthGuard>
  );
}
