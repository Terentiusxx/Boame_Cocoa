'use client';

import { useEffect, useMemo, useState } from 'react';
import ResultsPage, { type DiseaseOut, type ScanOut } from '@/components/results/ResultsPage';

type StoredPrediction = {
  disease_id?: number | null;
  confidence_score?: number | null;
  created_at?: string;
};

function getStoredPrediction(): StoredPrediction | null {
  try {
    const nonce = sessionStorage.getItem('scan_nonce') || '';
    const key = nonce ? `scan_prediction_${nonce}` : 'scan_prediction_last';
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as StoredPrediction;
  } catch {
    return null;
  }
}

export default function PredictResultsClient() {
  const [prediction, setPrediction] = useState<StoredPrediction | null>(null);
  const [disease, setDisease] = useState<DiseaseOut | null>(null);
  const [loading, setLoading] = useState(true);

  const diseaseId = useMemo(() => {
    const id = prediction?.disease_id;
    return typeof id === 'number' && id > 0 ? id : null;
  }, [prediction]);

  useEffect(() => {
    const stored = getStoredPrediction();
    setPrediction(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        if (!diseaseId) {
          if (!cancelled) setDisease(null);
          return;
        }

        const res = await fetch(`/api/diseases/${encodeURIComponent(String(diseaseId))}`);
        const payload = await res.json().catch(() => null);

        const unwrapped = payload && typeof payload === 'object' && 'data' in payload ? (payload as any).data : payload;
        if (!cancelled) setDisease(res.ok ? (unwrapped as DiseaseOut) : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [diseaseId]);

  if (loading) {
    return <ResultsPage mode="unknown" />;
  }

  const scan: ScanOut | null = prediction
    ? {
        disease_id: diseaseId,
        confidence_score: prediction.confidence_score ?? undefined,
        created_at: prediction.created_at ?? undefined,
      }
    : null;

  if (!diseaseId || !disease) {
    return <ResultsPage mode="unknown" />;
  }

  return <ResultsPage mode="known" scan={scan} disease={disease} />;
}
