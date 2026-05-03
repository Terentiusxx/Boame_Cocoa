'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FiAlertTriangle,
  FiImage,
  FiMic,
  FiSearch,
} from 'react-icons/fi';
import { EXPERT_ROUTES } from '@/lib/constants';
import ExpertNavbar from '@/components/expert/ExpertNavbar';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExpertProfile = {
  expert_id: number; first_name: string; last_name: string;
  email: string; specialization?: string; organization?: string;
  bio?: string; years_experienced?: number; rating?: number;
  is_verified?: boolean; image_url?: string; city?: string; country?: string;
} | null;

type Consultation = Record<string, unknown>;

function asNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function getConsultId(item: Consultation): number | null {
  return (
    asNumber(item.consult_id) ??
    asNumber(item.consultation_id) ??
    asNumber(item.id)
  );
}

function getUserId(item: Consultation): number | null {
  return asNumber(item.user_id) ?? asNumber(item.farmer_id);
}

function getCreatedAt(item: Consultation): string | null {
  return asString(item.created_at) ?? asString(item.updated_at);
}

function normalizeStatus(value: unknown): string {
  const s = typeof value === 'string' ? value : '';
  return s.trim().toLowerCase().replace(/\s+/g, '_');
}

function isNewRequest(item: Consultation): boolean {
  const status = normalizeStatus(item.status);
  return status === 'open' || status === 'pending' || status === 'new';
}

function getPriority(item: Consultation): string {
  const p = typeof item.priority === 'string' ? item.priority : '';
  return p.trim();
}

function timeAgoShort(dateStr?: string | null): string {
  if (!dateStr) return '';
  const t = new Date(dateStr).getTime();
  if (!Number.isFinite(t)) return '';

  const diffMs = Date.now() - t;
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMin < 60) return `${diffMin || 1}MINS AGO`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}HOURS AGO`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}DAYS AGO`;
}

function getFarmerName(item: Consultation): string {
  const direct =
    asString(item.farmer_name) ??
    asString(item.user_name) ??
    asString(item.name);

  if (direct) return direct;

  const first = asString(item.user_first_name) ?? asString(item.first_name) ?? '';
  const last = asString(item.user_last_name) ?? asString(item.last_name) ?? '';
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;

  const userId = getUserId(item);
  return userId ? `Farmer #${userId}` : 'Farmer';
}

function getSnippet(item: Consultation): string {
  const desc = asString(item.description) ?? asString(item.message) ?? asString(item.last_message);
  if (desc) return desc;
  const subject = asString(item.subject) ?? asString(item.title);
  return subject ?? 'Request details unavailable.';
}

function getThumb(item: Consultation): string {
  const url =
    asString(item.image_preview_url) ??
    asString(item.image_url) ??
    asString(item.thumbnail_url);

  if (url) return url;

  const priority = getPriority(item).toLowerCase();
  if (priority === 'high') return '/img/blackpod.png';
  if (priority === 'medium') return '/img/vascularstreak.png';
  return '/img/unknown.png';
}

function formatDuration(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  const n = asNumber(value);
  if (!n || n <= 0) return null;
  const mins = Math.floor(n / 60);
  const secs = Math.floor(n % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getMeta(item: Consultation):
  | { kind: 'urgent'; text: string; icon: React.ReactNode; className: string }
  | { kind: 'voice'; text: string; icon: React.ReactNode; className: string }
  | { kind: 'photos'; text: string; icon: React.ReactNode; className: string }
  | null {
  const priority = getPriority(item).toLowerCase();
  if (priority === 'high') {
    return {
      kind: 'urgent',
      text: 'URGENT ADVISORY',
      icon: <FiAlertTriangle size={13} />,
      className: 'text-urgency-medium',
    };
  }

  const voiceDuration = formatDuration(item.voice_memo_duration);
  const hasVoice = Boolean(asString(item.voice_memo_url)) || Boolean(voiceDuration);
  if (hasVoice) {
    return {
      kind: 'voice',
      text: `VOICE MEMO • ${voiceDuration ?? '0:00'}`,
      icon: <FiMic size={13} />,
      className: 'text-primary-green',
    };
  }

  const photosCount = asNumber(item.photos_count) ?? asNumber(item.images_count);
  const hasPhoto = Boolean(photosCount && photosCount > 0) || Boolean(asNumber(item.scan_id));
  if (hasPhoto) {
    const n = photosCount && photosCount > 0 ? photosCount : 1;
    return {
      kind: 'photos',
      text: `${n} PHOTOS ATTACHED`,
      icon: <FiImage size={13} />,
      className: 'text-brand-sub-text',
    };
  }

  return null;
}
// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpertDashboardClient({
  profile,
  consultations,
}: {
  profile: ExpertProfile;
  consultations: Consultation[];
}) {
  const expertInitials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || 'E'
    : 'E';

  const sorted = [...consultations].sort((a, b) => {
    const ta = new Date(getCreatedAt(a) ?? 0).getTime();
    const tb = new Date(getCreatedAt(b) ?? 0).getTime();
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });

  const newCount = sorted.filter(isNewRequest).length;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">

      <div className="px-6 pt-8 pb-24">

        {/* ── Top bar ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <Link href={EXPERT_ROUTES.PROFILE} className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-brand-buttons flex items-center justify-center shadow-card">
              {profile?.image_url ? (
                <Image src={profile.image_url} alt="Profile" fill className="object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">{expertInitials}</span>
              )}
            </div>
            <span className="text-lg font-bold text-brand-text-titles">Cocoa Archivist</span>
          </Link>

          <button
            type="button"
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-buttons shadow-sm transition hover:bg-green-50"
          >
            <FiSearch size={20} />
          </button>
        </div>

        {/* ── Section header ────────────────────────────────────────── */}
        <div className="mt-8 mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-brand-text-titles">Requests</h1>
          {newCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[11px] font-semibold text-primary-green">
              {newCount} NEW
            </span>
          )}
        </div>

        {/* ── List ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {sorted.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center">
              <p className="text-sm text-brand-sub-text">No requests yet.</p>
            </div>
          )}

          {sorted.map((item, idx) => {
            const consultId = getConsultId(item);
            const href = consultId ? `${EXPERT_ROUTES.CONSULTATIONS}/${consultId}` : EXPERT_ROUTES.CONSULTATIONS;
            const name = getFarmerName(item);
            const snippet = getSnippet(item);
            const createdAt = getCreatedAt(item);
            const time = timeAgoShort(createdAt);
            const meta = getMeta(item);
            const thumb = getThumb(item);
            const isNew = isNewRequest(item);

            return (
              <Link
                key={String(consultId ?? idx)}
                href={href}
                className="block bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition active:scale-[0.98]"
              >
                <div className="p-4 flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image src={thumb} alt="" fill className="object-cover" />
                    {isNew && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary-green border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-brand-text-titles text-sm leading-tight truncate">
                        {name}
                      </p>
                      {time && (
                        <p className="text-[10px] font-semibold text-brand-sub-text uppercase shrink-0">
                          {time}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-brand-sub-text mt-1.5 line-clamp-2">“{snippet}”</p>

                    {meta && (
                      <div className={`mt-3 flex items-center gap-2 text-[11px] font-semibold tracking-wider ${meta.className}`}>
                        {meta.icon}
                        <span>{meta.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <ExpertNavbar />
    </div>
  );
}
