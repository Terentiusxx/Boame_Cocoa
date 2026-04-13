/**
 * ExpertDashboardClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Expert home screen — shows profile summary, stats, and quick actions.
 * Data pre-fetched server-side and passed as props.
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color} flex items-center gap-3`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
      </div>
    </div>
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

  const name      = profile ? `${profile.first_name} ${profile.last_name}` : 'Expert';
  const initials  = profile ? `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase() : 'E';
  const rating    = profile?.rating ?? (dashboard?.average_rating as number | undefined);
  const openCount = (dashboard?.open_consultations ?? dashboard?.total_open ?? 0) as number;
  const doneCount = (dashboard?.resolved_consultations ?? dashboard?.total_resolved ?? 0) as number;
  const totalCount= (dashboard?.total_consultations ?? 0) as number;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Green header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 px-6 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-16 -left-8 w-36 h-36 rounded-full bg-white" />
        </div>

        <div className="relative flex items-start justify-between mb-6">
          <div>
            <p className="text-green-100 text-sm mb-1">Welcome back,</p>
            <h1 className="text-white text-2xl font-bold">{name}</h1>
            {profile?.specialization && (
              <p className="text-green-200 text-sm mt-0.5">{profile.specialization}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            aria-label="Log out"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            <FiLogOut size={16} />
          </button>
        </div>

        {/* Profile avatar */}
        <div className="flex items-center gap-4 relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/30 flex items-center justify-center shadow-lg">
            {profile?.image_url ? (
              <Image src={profile.image_url} alt={name} fill className="object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">{initials}</span>
            )}
          </div>
          <div>
            {profile?.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white mb-1">
                <FiCheck size={11} /> Verified Expert
              </span>
            )}
            {rating != null && (
              <div className="flex items-center gap-1 text-white">
                <FiStar size={14} className="fill-yellow-300 text-yellow-300" />
                <span className="text-sm font-semibold">{Number(rating).toFixed(1)}</span>
                <span className="text-white/60 text-xs">rating</span>
              </div>
            )}
            {profile?.organization && (
              <p className="text-green-100 text-xs mt-0.5">{profile.organization}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat cards (pulled up over header) ─────────────────────────── */}
      <div className="px-5 -mt-10 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<FiClock size={18} className="text-orange-600" />}  label="Open"     value={openCount}  color="bg-orange-50 text-orange-800" />
          <StatCard icon={<FiCheck size={18} className="text-green-600" />}    label="Resolved"  value={doneCount}  color="bg-green-50 text-green-800" />
          <StatCard icon={<FiClipboard size={18} className="text-blue-600" />} label="Total"     value={totalCount} color="bg-blue-50 text-blue-800" />
        </div>
      </div>

      {/* ── Quick actions ──────────────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href={EXPERT_ROUTES.CONSULTATIONS}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start gap-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <FiMessageCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Consultations</p>
              <p className="text-xs text-gray-400 mt-0.5">Manage farmer requests</p>
            </div>
          </Link>

          <Link href={EXPERT_ROUTES.PROFILE}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start gap-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiUser size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">My Profile</p>
              <p className="text-xs text-gray-400 mt-0.5">Edit public profile</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Profile bio snippet ─────────────────────────────────────────────── */}
      {profile?.bio && (
        <div className="px-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">About You</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{profile.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
}
