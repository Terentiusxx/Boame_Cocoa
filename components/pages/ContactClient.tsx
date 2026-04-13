/**
 * ContactClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Expert listing page. Receives server-fetched data as props —
 * no GET fetches happen in this component.
 *
 * Server fetches (in app/contact/page.tsx):
 *   GET /experts   → experts prop
 *   GET /users/me  → userCity prop (for location display)
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiStar, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type Expert = {
  expert_id: number;
  first_name: string;
  last_name: string;
  specialization?: string;
  organization?: string;
  bio?: string;
  years_experienced?: number;
  rating?: number;
  location?: string;
  photo?: string | null;
  is_verified?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sort experts: verified first, then rating descending, then name */
function rankExperts(experts: Expert[]): Expert[] {
  return [...experts].sort((a, b) => {
    if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
    if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
    return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
  });
}

/** Initials avatar when no photo is available */
function AvatarFallback({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  return (
    <div className="w-14 h-14 rounded-full bg-primary-green flex items-center justify-center text-white font-bold text-lg shrink-0">
      {initials}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactClient({
  experts,
  userCity,
  scanId,
}: {
  experts: Expert[];
  userCity: string | null;
  scanId?: string;
}) {
  const router = useRouter();
  const ranked = rankExperts(experts);

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-24">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between py-4 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-brand-text-titles">Talk to an Expert</h1>
          <div className="w-9" />
        </div>

        {userCity && (
          <p className="text-sm text-brand-sub-text mb-4 flex items-center gap-1">
            <FiMapPin size={14} /> Showing experts near <strong>{userCity}</strong>
          </p>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {ranked.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-10">No experts available at this time.</p>
        )}

        {/* ── Expert Cards ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {ranked.map((expert) => (
            <div
              key={expert.expert_id}
              className="bg-white rounded-brand p-4 shadow-card cursor-pointer transition-shadow hover:shadow-card-hover"
              onClick={() =>
                router.push(
                  `/contact/form?expert_id=${expert.expert_id}${scanId ? `&scan_id=${scanId}` : ''}`
                )
              }
            >
              <div className="flex items-start gap-3">

                {/* Avatar */}
                {expert.photo ? (
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={expert.photo}
                      alt={`${expert.first_name} ${expert.last_name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <AvatarFallback name={`${expert.first_name} ${expert.last_name}`} />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {expert.first_name} {expert.last_name}
                    </h3>
                    {expert.is_verified && (
                      <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
                        Verified
                      </span>
                    )}
                  </div>

                  {expert.specialization && (
                    <p className="text-xs text-brand-sub-text mt-0.5">{expert.specialization}</p>
                  )}
                  {expert.bio && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{expert.bio}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    {expert.rating !== undefined && (
                      <span className="flex items-center gap-1">
                        <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
                        {expert.rating.toFixed(1)}
                      </span>
                    )}
                    {expert.years_experienced !== undefined && (
                      <span>{expert.years_experienced}y exp.</span>
                    )}
                    {expert.location && (
                      <span className="flex items-center gap-0.5">
                        <FiMapPin size={11} /> {expert.location}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-brand-buttons shrink-0 self-center">
                  Contact →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
