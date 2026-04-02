'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMapPin, FiStar } from 'react-icons/fi';
import type { Expert } from '@/lib/types';

type MaybeWrapped<T> = T | { data?: T };

function unwrapData<T>(value: MaybeWrapped<T> | null): T | null {
  if (!value) return null;
  if (typeof value === 'object' && 'data' in value) {
    return ((value as { data?: T }).data ?? null) as T | null;
  }
  return value as T;
}

function normalizeLocation(value: string) {
  return value.trim().toLowerCase();
}

function locationMatchScore(userLocation: string, expertLocation?: string) {
  const user = normalizeLocation(userLocation);
  const expert = normalizeLocation(expertLocation ?? '');

  if (!user || !expert) return 4;
  if (user === expert) return 0;
  if (expert.includes(user) || user.includes(expert)) return 1;

  const userParts = user.split(/[,-]/).map((s) => s.trim()).filter(Boolean);
  const expertParts = expert.split(/[,-]/).map((s) => s.trim()).filter(Boolean);
  const overlap = userParts.some((part) => expertParts.includes(part));
  if (overlap) return 2;

  return 3;
}

function fullName(expert: Expert) {
  return [expert.first_name, expert.mid_name, expert.last_name].filter(Boolean).join(' ').trim() || 'Unnamed Expert';
}

function formatRating(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'New';
  return value.toFixed(1);
}

export default function ContactClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanIdParam = searchParams.get('scan_id');

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadExperts = async () => {
      setLoadingExperts(true);
      setExpertsError(null);

      try {
        const [expertsRes, meRes, dashRes] = await Promise.all([
          fetch('/api/experts', { method: 'GET' }),
          fetch('/api/users/me', { method: 'GET' }),
          fetch('/api/users/dashboard', { method: 'GET' }),
        ]);

        const expertsPayload = (await expertsRes.json().catch(() => null)) as MaybeWrapped<Expert[]> | null;
        const expertsData = unwrapData<Expert[]>(expertsPayload);

        if (!expertsRes.ok) {
          throw new Error('Failed to load experts. Please try again.');
        }

        const mePayload = (await meRes.json().catch(() => null)) as Record<string, unknown> | null;
        const dashPayload = (await dashRes.json().catch(() => null)) as Record<string, unknown> | null;

        const meData = unwrapData<Record<string, unknown>>(mePayload as MaybeWrapped<Record<string, unknown>>);
        const dashData = unwrapData<Record<string, unknown>>(dashPayload as MaybeWrapped<Record<string, unknown>>);

        const detectedLocation =
          (meData?.location as string | undefined) ||
          (meData?.district as string | undefined) ||
          (meData?.region as string | undefined) ||
          (meData?.city as string | undefined) ||
          (dashData?.location as string | undefined) ||
          (dashData?.district as string | undefined) ||
          ((dashData?.user as Record<string, unknown> | undefined)?.location as string | undefined) ||
          '';

        if (!mounted) return;

        const normalizedExperts = Array.isArray(expertsData) ? expertsData : [];
        setExperts(normalizedExperts);
        setUserLocation(detectedLocation);
      } catch (error) {
        if (!mounted) return;
        setExpertsError(error instanceof Error ? error.message : 'Unable to load experts right now.');
      } finally {
        if (mounted) setLoadingExperts(false);
      }
    };

    void loadExperts();

    return () => {
      mounted = false;
    };
  }, []);

  const rankedExperts = useMemo(() => {
    return [...experts].sort((a, b) => {
      const byLocation = locationMatchScore(userLocation, a.location) - locationMatchScore(userLocation, b.location);
      if (byLocation !== 0) return byLocation;

      if (Boolean(a.is_verified) !== Boolean(b.is_verified)) {
        return a.is_verified ? -1 : 1;
      }

      const byRating = (b.rating ?? 0) - (a.rating ?? 0);
      if (byRating !== 0) return byRating;

      return fullName(a).localeCompare(fullName(b));
    });
  }, [experts, userLocation]);

  const buildFormLink = (expertId: number) => {
    const params = new URLSearchParams();
    params.set('expert_id', String(expertId));
    if (scanIdParam) params.set('scan_id', scanIdParam);
    return `/contact/form?${params.toString()}`;
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/home');
  };

  const renderExpertCards = (items: Expert[]) => {
    return items.map((expert) => (
      <Link
        key={expert.expert_id}
        href={buildFormLink(expert.expert_id)}
        className="block rounded-2xl border border-gray-200 bg-white p-4 hover:border-green-300 transition-all"
      >
        <div className="flex items-start gap-3">
          <img
            src={expert.photo || '/img/homelogo.png'}
            alt={fullName(expert)}
            className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-brand-text-titles truncate">{fullName(expert)}</p>
            <p className="text-sm text-brand-sub-text truncate mt-1">{expert.specialization || 'Cocoa Specialist'}</p>

            <div className="mt-2 flex items-center gap-3 text-xs text-brand-sub-text">
              <span className="inline-flex items-center gap-1">
                <FiMapPin size={13} />
                {expert.location || 'Unknown location'}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700">
                <FiStar size={13} />
                {formatRating(expert.rating)}
              </span>
            </div>

            <span className="inline-block mt-3 text-xs font-semibold text-brand-buttons">Select and Continue</span>
          </div>
        </div>
      </Link>
    ));
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between py-4 mb-6">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">&lt;</span>
          </button>
          <h1 className="text-xl font-semibold text-brand-text-titles">Choose Expert</h1>
          <div className="w-9"></div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {loadingExperts ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-brand-sub-text">Loading experts...</div>
            ) : null}

            {expertsError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{expertsError}</div>
            ) : null}

            {!loadingExperts && !expertsError && rankedExperts.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-brand-sub-text">
                No experts available right now.
              </div>
            ) : null}

            {!loadingExperts && !expertsError && rankedExperts.length > 0 ? (
              <div className="space-y-3">{renderExpertCards(rankedExperts)}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
