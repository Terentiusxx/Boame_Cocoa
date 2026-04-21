/**
 * ExpertDashboardClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Expert home screen — shows profile summary, stats, and quick actions.
 * Data pre-fetched server-side and passed as props.
 * Design matches the user-side home screen pattern.
 */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiStar, FiMessageCircle, FiUser, FiLogOut, FiClipboard, FiCheck, FiClock } from 'react-icons/fi';
import { EXPERT_ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExpertProfile = {
  expert_id: number; first_name: string; last_name: string;
  email: string; specialization?: string; organization?: string;
  bio?: string; years_experienced?: number; rating?: number;
  is_verified?: boolean; image_url?: string; city?: string; country?: string;
} | null;

type DashboardData = Record<string, unknown> | null;

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${color} flex flex-col gap-2`}>
      <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium opacity-60">{label}</p>
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

function ActionCard({ href, icon, title, subtitle, iconBg }: {
  href: string; icon: React.ReactNode; title: string; subtitle: string; iconBg: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card flex flex-col items-start gap-3 hover:shadow-card-hover transition active:scale-95"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-brand-sub-text mt-0.5">{subtitle}</p>
      </div>
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpertDashboardClient({
  profile,
  dashboard,
}: {
  profile: ExpertProfile;
  dashboard: DashboardData;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/expert-auth/logout', { method: 'POST' });
    router.replace(EXPERT_ROUTES.LOGIN);
  };

  const name     = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Expert' : 'Expert';
  const initials = profile ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || 'E' : 'E';
  const rating     = profile?.rating ?? (dashboard?.average_rating as number | undefined);
  const openCount  = (dashboard?.open_consultations ?? dashboard?.total_open   ?? 0) as number;
  const doneCount  = (dashboard?.resolved_consultations ?? dashboard?.total_resolved ?? 0) as number;
  const totalCount = (dashboard?.total_consultations ?? 0) as number;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile pb-10">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-6 pt-12 pb-6 flex items-start justify-between">
        <div>
          {/* Expert badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-green" />
            <span className="text-[11px] font-semibold text-primary-green uppercase tracking-wide">Expert Portal</span>
          </div>
          <p className="text-brand-sub-text text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-brand-text-titles mt-0.5">{name}</h1>
          {profile?.specialization && (
            <p className="text-sm text-brand-sub-text mt-0.5">{profile.specialization}</p>
          )}
        </div>

        {/* Avatar + logout */}
        <div className="flex flex-col items-end gap-2">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-brand-buttons flex items-center justify-center shadow-card">
            {profile?.image_url ? (
              <Image src={profile.image_url} alt={name} fill className="object-cover" />
            ) : (
              <span className="text-white text-lg font-bold">{initials}</span>
            )}
          </div>
          {profile?.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-semibold text-primary-green">
              <FiCheck size={9} /> Verified
            </span>
          )}
          {rating != null && (
            <div className="flex items-center gap-1 text-brand-sub-text">
              <FiStar size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold">{Number(rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<FiClock size={16} className="text-orange-600" />}
            label="Open" value={openCount}
            color="bg-orange-50 text-orange-800"
          />
          <StatCard
            icon={<FiCheck size={16} className="text-primary-green" />}
            label="Resolved" value={doneCount}
            color="bg-green-50 text-green-800"
          />
          <StatCard
            icon={<FiClipboard size={16} className="text-blue-600" />}
            label="Total" value={totalCount}
            color="bg-blue-50 text-blue-800"
          />
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            href={EXPERT_ROUTES.CONSULTATIONS}
            icon={<FiMessageCircle size={20} className="text-primary-green" />}
            iconBg="bg-green-50"
            title="Consultations"
            subtitle="Manage farmer requests"
          />
          <ActionCard
            href={EXPERT_ROUTES.PROFILE}
            icon={<FiUser size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
            title="My Profile"
            subtitle="Edit public profile"
          />
        </div>
      </div>

      {/* ── Bio snippet ──────────────────────────────────────────────────── */}
      {profile?.bio && (
        <div className="px-5 mb-6">
          <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-3">About You</h2>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{profile.bio}</p>
          </div>
        </div>
      )}

      {/* ── Logout ───────────────────────────────────────────────────────── */}
      <div className="px-5">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="w-full flex items-center justify-center gap-2 rounded-brand border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition active:scale-95"
        >
          <FiLogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
