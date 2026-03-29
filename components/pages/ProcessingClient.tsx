'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';


type ScanCreateResponse = {
  data?: { scan_id?: number; id?: number };
  scan_id?: number;
  id?: number;
};

type PredictResponse = {
  data?: any;
  scan_id?: number;
  id?: number;
  disease_id?: number;
  predicted_disease?: string;
  confidence_score?: number;
  confidence?: number;
};

function unwrap<T>(value: any): T {
  if (value && typeof value === 'object' && 'data' in value) return (value as any).data as T;
  return value as T;
}

function extractScanId(payload: unknown): number | null {
  const data = unwrap<any>(payload as any);
  const candidate =
    data?.scan_id ??
    data?.id ??
    data?.data?.scan_id ??
    data?.data?.id;

  const asNumber = typeof candidate === 'number' ? candidate : Number(String(candidate ?? ''));
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null;
}

function extractPrediction(payload: unknown): { diseaseId: number | null; confidence: number | null } {
  const data = unwrap<any>(payload as any);
  const diseaseCandidate =
    data?.disease_id ??
    data?.prediction?.disease_id ??
    data?.result?.disease_id ??
    data?.data?.disease_id;

  const confidenceCandidate =
    data?.confidence ??
    data?.confidence_score ??
    data?.prediction?.confidence_score ??
    data?.result?.confidence_score ??
    data?.data?.confidence_score;

  const diseaseId =
    typeof diseaseCandidate === 'number'
      ? diseaseCandidate
      : Number.isFinite(Number(String(diseaseCandidate ?? '')))
        ? Number(String(diseaseCandidate))
        : null;

  const confidence =
    typeof confidenceCandidate === 'number'
      ? confidenceCandidate
      : Number.isFinite(Number(String(confidenceCandidate ?? '')))
        ? Number(String(confidenceCandidate))
        : null;

  return {
    diseaseId: diseaseId && diseaseId > 0 ? diseaseId : null,
    confidence: confidence != null && Number.isFinite(confidence) ? confidence : null,
  };
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

export default function ProcessingClient() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      const imageDataUrl = sessionStorage.getItem('scan_image');
      const nonce = sessionStorage.getItem('scan_nonce') || '';

      const inflightKey = nonce ? `scan_inflight_${nonce}` : '';
      const resultKey = nonce ? `scan_result_${nonce}` : '';
      const errorKey = nonce ? `scan_error_${nonce}` : '';

      if (!imageDataUrl) {
        router.replace('/scan');
        return;
      }

      // If a previous mount already completed AND we're past the voice-describe, continue to results.
      if (resultKey) {
        const existingScanId = sessionStorage.getItem(resultKey);
        const voiceCompleted = sessionStorage.getItem(`voice_completed_${nonce}`);
        if (existingScanId && voiceCompleted === '1') {
          sessionStorage.removeItem('scan_image');
          sessionStorage.removeItem('scan_nonce');
          sessionStorage.removeItem(inflightKey);
          sessionStorage.removeItem(errorKey);
          if (!cancelled) router.replace(`/results/${existingScanId}`);
          return;
        }
      }

      // If another mount already started the request, wait for it to finish.
      if (inflightKey && sessionStorage.getItem(inflightKey) === '1') {
        for (let i = 0; i < 80; i++) {
          if (cancelled) return;

          const finishedScanId = resultKey ? sessionStorage.getItem(resultKey) : null;
          if (finishedScanId) {
            sessionStorage.removeItem('scan_image');
            sessionStorage.removeItem('scan_nonce');
            sessionStorage.removeItem(inflightKey);
            sessionStorage.removeItem(errorKey);
            // Go to voice-describe, not results
            router.replace(`/voice-describe?scan_id=${finishedScanId}`);
            return;
          }

          if (errorKey && sessionStorage.getItem(errorKey) === '1') {
            sessionStorage.removeItem('scan_image');
            sessionStorage.removeItem('scan_nonce');
            sessionStorage.removeItem(inflightKey);
            router.replace('/results/unknown');
            return;
          }

          await sleep(150);
        }

        router.replace('/results/unknown');
        return;
      }

      if (inflightKey) sessionStorage.setItem(inflightKey, '1');

      try {
        // Predict using AI endpoint (multipart/form-data with `file`)
        const blob = await dataUrlToBlob(imageDataUrl);
        const form = new FormData();
        form.append('file', blob, 'scan.jpg');

        const predictResponse = await fetch('/api/ai/predict', {
          method: 'POST',
          body: form,
        });

        const predictPayload =
          (await predictResponse.json().catch(() => null)) as PredictResponse | null;

        const scanId = extractScanId(predictPayload);
        const prediction = extractPrediction(predictPayload);

        if (nonce) {
          const predKey = `scan_prediction_${nonce}`;
          sessionStorage.setItem(
            predKey,
            JSON.stringify({
              disease_id: prediction.diseaseId,
              confidence_score: prediction.confidence,
              created_at: new Date().toISOString(),
            })
          );
        } else {
          sessionStorage.setItem(
            'scan_prediction_last',
            JSON.stringify({
              disease_id: prediction.diseaseId,
              confidence_score: prediction.confidence,
              created_at: new Date().toISOString(),
            })
          );
        }

        if (!predictResponse.ok) {
          if (nonce && errorKey) sessionStorage.setItem(errorKey, '1');
          if (inflightKey) sessionStorage.removeItem(inflightKey);
          sessionStorage.removeItem('scan_image');
          sessionStorage.removeItem('scan_nonce');
          if (cancelled) return;
          router.replace('/results/unknown');
          return;
        }

        if (!scanId) {
          if (nonce && errorKey) sessionStorage.setItem(errorKey, '1');
          if (inflightKey) sessionStorage.removeItem(inflightKey);
          sessionStorage.removeItem('scan_image');
          sessionStorage.removeItem('scan_nonce');
          if (cancelled) return;
          router.replace('/results/unknown');
          return;
        }

        if (nonce && resultKey) {
          sessionStorage.setItem(resultKey, String(scanId));
        }

        if (inflightKey) sessionStorage.removeItem(inflightKey);
        sessionStorage.removeItem('scan_image');
        sessionStorage.removeItem('scan_nonce');

        if (cancelled) return;

        router.replace(`/voice-describe?scan_id=${scanId}`);
      } catch {
        if (nonce && errorKey) sessionStorage.setItem(errorKey, '1');
        if (inflightKey) sessionStorage.removeItem(inflightKey);
        sessionStorage.removeItem('scan_image');
        sessionStorage.removeItem('scan_nonce');
        if (cancelled) return;
        router.replace('/results/unknown');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">

      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Image...</h2>

        <p className="text-gray-600 leading-relaxed max-w-xs">
          Our AI is examining your cocoa plant to identify any diseases or issues.
        </p>

        <div className="mt-8 space-y-3 text-sm">
          <div className="flex items-center text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-3 flex items-center justify-center">
              <FiCheck size={12} className="text-white" />
            </div>
            Image captured successfully
          </div>

          <div className="flex items-center text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-3 flex items-center justify-center">
              <FiCheck size={12} className="text-white" />
            </div>
            Processing with AI model
          </div>

          <div className="flex items-center text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 animate-pulse"></div>
            Generating diagnosis...
          </div>
        </div>
      </div>
    </div>
  );
}
