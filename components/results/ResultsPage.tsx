'use client';

import Link from 'next/link';

type Treatment = { name?: string };

export type DiseaseOut = {
  disease_id?: number;
  name?: string;
  description?: string;
  urgency_level?: string;
  icon_name?: string;
  treatments?: Treatment[];
};

export type ScanOut = {
  scan_id?: number;
  disease_id?: number | null;
  confidence_score?: number;
  created_at?: string;
};

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

function urgencyLabel(value?: string) {
  if (!value) return 'Unknown';
  const v = value.toLowerCase();
  if (v === 'high') return 'High Urgency';
  if (v === 'medium') return 'Medium Urgency';
  if (v === 'low') return 'Low Urgency';
  return value;
}

function urgencyTextClass(value?: string) {
  const v = value?.toLowerCase();
  if (v === 'high') return 'text-urgency-high';
  if (v === 'medium') return 'text-urgency-medium';
  if (v === 'low') return 'text-urgency-low';
  return 'text-gray-700';
}

export default function ResultsPage(props: {
  mode: 'known' | 'unknown';
  scanId?: number;
  scan?: ScanOut | null;
  disease?: DiseaseOut | null;
}) {
  if (props.mode === 'unknown') {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
        <StatusBar />

        <div className="px-6 pb-6 flex flex-col h-full">
          <div className="flex items-center justify-between py-4 mb-6">
            <Link
              href="/scan"
              className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
            >
              <span className="text-xl">‹</span>
            </Link>
            <h1 className="text-xl font-semibold text-brand-text-titles">Results</h1>
            <button className="text-xl">✕</button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6">
              <div className="text-white text-4xl">↻</div>
            </div>

            <h2 className="text-3xl font-bold text-brand-text-titles mb-4">Unknown</h2>

            <p className="text-brand-sub-text font-normal leading-relaxed mb-8 max-w-xs">
              We cannot identify the disease your cocoa has. Please try again from a different angle.
            </p>

            <div className="w-full max-w-sm space-y-4">
              <Link
                href="/scan"
                className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 block"
              >
                Try Again
              </Link>

              <Link
                href={props.scanId ? `/contact?scan_id=${encodeURIComponent(String(props.scanId))}` : '/contact'}
                className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 block bg-green-700"
              >
                Contact Expert
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const diseaseName = props.disease?.name ?? 'Disease not found';
  const urgency = urgencyLabel(props.disease?.urgency_level);
  const icon = props.disease?.icon_name || '🌿';
  const treatments = props.disease?.treatments?.map((t: Treatment) => t.name).filter(Boolean) as string[] | undefined;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between py-4 mb-6">
          <Link
            href="/scan"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Results</h1>
          <button className="text-xl">✕</button>
        </div>

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{icon}</span>
          </div>

          <h2 className="text-2xl font-bold text-brand-text-titles mb-2">{diseaseName}</h2>
          <p className={`${urgencyTextClass(props.disease?.urgency_level)} text-lg font-semibold mb-4`}>{urgency}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-brand-sub-titles mb-2">Description:</h3>
            <p className="text-brand-sub-text font-normal text-sm leading-relaxed mb-4">
              {props.disease?.description ?? 'No description available'}
            </p>

            <h3 className="font-semibold text-brand-sub-titles mb-2">Treatment:</h3>
            <p className="text-brand-sub-text font-normal text-sm leading-relaxed">
              {treatments?.length ? treatments.join(', ') : 'No treatments listed.'}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/scan"
              className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 block"
            >
              Scan Another
            </Link>

            <Link
              href="/home"
              className="block w-full py-3 text-center text-brand-hyperlink underline cursor-pointer hover:opacity-80 font-semibold"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
