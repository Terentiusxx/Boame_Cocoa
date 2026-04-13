/**
 * app/results/[id]/page.tsx
 * Server Component — fetches scan and disease data server-side.
 *
 * Routes:
 *   /results/unknown  → show the "could not identify" result screen
 *   /results/predict  → redirect via PredictResultsClient (reads sessionStorage scan_id)
 *   /results/:scanId  → fetch scan + disease from backend, render result
 */
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import ResultsPage, { type DiseaseOut, type ScanOut } from '@/components/results/ResultsPage';
import PredictResultsClient from '@/components/results/PredictResultsClient';
import { serverApi } from '@/lib/serverAPI';
import { unwrapData } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

async function safeApi<T>(path: string): Promise<T | null> {
  try {
    const payload = await serverApi<T>(path);
    return unwrapData<T>(payload as { data?: T }) ?? (payload as T) ?? null;
  } catch {
    return null;
  }
}

function NotFound() {
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 py-4">
        <p className="text-brand-sub-text mb-4">Disease not found.</p>
        <Link
          href={ROUTES.HOME}
          className="block w-full rounded-brand bg-brand-buttons py-4 text-center text-base font-semibold text-white hover:opacity-90 transition"
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ── Special route: unknown result ─────────────────────────────────────────
  if (id === 'unknown') {
    return (
      <AuthGuard type="protected">
        <ResultsPage mode="unknown" />
      </AuthGuard>
    );
  }

  // ── Special route: predict (reads sessionStorage scan_id client-side) ─────
  if (id === 'predict') {
    return (
      <AuthGuard type="protected">
        <PredictResultsClient />
      </AuthGuard>
    );
  }

  // ── Numeric scan ID route ─────────────────────────────────────────────────
  const scanId = Number(id);
  if (!Number.isFinite(scanId) || scanId <= 0) {
    return (
      <AuthGuard type="protected">
        <ResultsPage mode="unknown" />
      </AuthGuard>
    );
  }

  // Fetch scan, then disease — all server-side
  const scan = await safeApi<ScanOut>(`/scans/${scanId}`);
  const diseaseId = scan?.disease_id ?? null;

  if (!diseaseId) {
    return (
      <AuthGuard type="protected">
        <ResultsPage mode="unknown" scanId={scanId} scan={scan} />
      </AuthGuard>
    );
  }

  const disease = await safeApi<DiseaseOut>(`/diseases/${diseaseId}`);

  if (!disease) {
    return (
      <AuthGuard type="protected">
        <NotFound />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard type="protected">
      <ResultsPage mode="known" scanId={scanId} scan={scan} disease={disease} />
    </AuthGuard>
  );
}
