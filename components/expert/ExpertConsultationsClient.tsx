/**
 * ExpertConsultationsClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Lists all consultations assigned to the expert.
 * Filterable by status. Clicking navigates to the detail view.
 * Design matches the user-side inner-screen pattern.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiClipboard } from 'react-icons/fi';
import { formatDateTime } from '@/lib/utils';
import { EXPERT_ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type Consultation = {
  consult_id: number; user_id: number; scan_id?: number; expert_id: number;
  subject: string; description?: string; priority: string;
  status: string; created_at: string; updated_at: string; resolution_note?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { badge: string; dot: string }> = {
  Open:        { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  In_Progress: { badge: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400'   },
  Resolved:    { badge: 'bg-green-50 text-green-700 border-green-200',     dot: 'bg-green-500'  },
  Closed:      { badge: 'bg-gray-50 text-gray-500 border-gray-200',        dot: 'bg-gray-400'   },
};

const PRIORITY_STYLE: Record<string, string> = {
  High:   'text-urgency-high',
  Medium: 'text-urgency-medium',
  Low:    'text-urgency-low',
};

const FILTERS = ['All', 'Open', 'In_Progress', 'Resolved', 'Closed'] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpertConsultationsClient({ consultations }: { consultations: Consultation[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<'All' | typeof FILTERS[number]>('All');

  const visible = filter === 'All'
    ? consultations
    : consultations.filter((c) => c.status === filter);

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          type="button"
          onClick={() => router.replace(EXPERT_ROUTES.DASHBOARD)}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
        >
          <FiArrowLeft size={18} />
        </button>

        <h1 className="text-base font-bold text-brand-text-titles">Consultations</h1>

        {/* Right spacer keeps title centred */}
        <div className="w-9" />
      </div>

      {/* ── Sub-header count ─────────────────────────────────────────── */}
      <div className="px-5 pb-3">
        <p className="text-xs text-brand-sub-text">{consultations.length} total requests</p>
      </div>

      {/* ── Filter chips ─────────────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === f
                  ? 'bg-brand-buttons text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-green'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
          <FiClipboard size={44} className="text-gray-300" />
          <p className="text-sm text-brand-sub-text">
            No {filter !== 'All' ? filter.replace('_', ' ').toLowerCase() : ''} consultations yet.
          </p>
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────────────── */}
      <div className="px-5 space-y-3 pb-10">
        {visible.map((c) => {
          const style  = STATUS_STYLE[c.status] ?? STATUS_STYLE.Open!;
          const pStyle = PRIORITY_STYLE[c.priority] ?? 'text-gray-500';

          return (
            <Link
              key={c.consult_id}
              href={`${EXPERT_ROUTES.CONSULTATIONS}/${c.consult_id}`}
              className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-card hover:shadow-card-hover transition active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1 line-clamp-1">
                  {c.subject}
                </h3>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              {c.description && (
                <p className="text-xs text-brand-sub-text line-clamp-2 mb-3">{c.description}</p>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold flex items-center gap-1 ${pStyle}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  {c.priority} Priority
                </span>
                <span className="text-brand-sub-text">{formatDateTime(c.created_at)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
