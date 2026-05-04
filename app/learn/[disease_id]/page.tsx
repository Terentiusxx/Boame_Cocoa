import LearnPage from './learnpage';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';
import { notFound } from 'next/navigation';
import type { DiseaseOut } from './learnpage';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ disease_id: string }>;
}) {
  const { disease_id } = await params;

  try {
    const payload = await serverApi<DiseaseOut>(`/diseases/${disease_id}`);
    const disease =
      unwrapData<DiseaseOut>(payload as { data?: DiseaseOut }) ??
      (payload as DiseaseOut);
    if (!disease?.name) notFound();
    return <LearnPage disease={disease} />;
  } catch {
    notFound();
  }
}
