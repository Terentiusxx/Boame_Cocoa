import Link from 'next/link';
import ResultsPage, { type DiseaseOut, type ScanOut } from '@/components/results/ResultsPage';
import { serverApi } from '@/lib/serverAPI';

type WithData<T> = { data: T };

type MaybeWrapped<T> = T | WithData<T>;

function unwrap<T>(value: MaybeWrapped<T>): T {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as WithData<T>).data;
  }
  return value as T;
}

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

function DiseaseNotFound() {
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />
      <div className="px-6 py-4">
        <p>Disease not found</p>
        <Link
          href="/home"
          className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 mt-4"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default async function ResultsRoute({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  if (id === 'unknown') {
    return <ResultsPage mode="unknown" />;
  }

  const scanId = Number(id);
  if (!Number.isFinite(scanId) || scanId <= 0) {
    return <ResultsPage mode="unknown" />;
  }

  try {
    const scan = unwrap(await serverApi<MaybeWrapped<ScanOut>>(`/scans/${scanId}`));

    const diseaseId = scan?.disease_id ?? null;
    if (!diseaseId) {
      return <ResultsPage mode="unknown" scanId={scanId} scan={scan} disease={null} />;
    }

    const disease = unwrap(await serverApi<MaybeWrapped<DiseaseOut>>(`/diseases/${diseaseId}`));

    if (!disease) {
      return <DiseaseNotFound />;
    }

    return <ResultsPage mode="known" scanId={scanId} scan={scan} disease={disease} />;
  } catch {
    return <ResultsPage mode="unknown" />;
  }
}
