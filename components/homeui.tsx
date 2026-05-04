/**
 * homeui.tsx
 * ─────────────────────────────────────────────────────────────
 * Home page UI component.
 * Receives server-fetched data (recentScans, firstName) as props —
 * the page.tsx Server Component handles all data fetching.
 *
 * NOTE: Do NOT render BottomNavigation here. It is already handled
 * globally by ConditionalNavbar in app/layout.tsx.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import DiseaseCard from '@/components/DiseaseCard';
import CheckCocoaCard from '@/components/CheckCocoaCard';
import IconComponent from '@/components/IconComponent';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { DiseaseData } from '@/lib/types';
import { extractErrorMessage, formatDateTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
  isRead: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise raw notification API response to a flat array of NotificationItems */
function parseNotifications(payload: unknown): NotificationItem[] {
  // Backend may return the array directly or wrapped in { data: [...] }
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>)?.data)
    ? (payload as Record<string, unknown[]>).data
    : [];

  return (raw as Record<string, unknown>[]).map((item, i) => ({
    id: String(item.notification_id ?? item.id ?? i + 1),
    title: String(item.title ?? 'Notification'),
    message: String(item.message ?? item.content ?? 'No details available.'),
    createdAt: typeof item.created_at === 'string' ? item.created_at : undefined,
    isRead: Boolean(item.is_read),
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeUI({
  recentScans,
  firstName,
}: {
  recentScans: DiseaseData[];
  firstName?: string | null;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetch notifications when the bell dialog opens */
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load notifications');
      const payload = await res.json();
      setNotifications(parseNotifications(payload));
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load notifications. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Count unread for the red dot indicator
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-24 pt-8">

        {/* ── Greeting + Action Bar ───────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-brand-text-titles">
            Hey{firstName ? ` ${firstName}` : ''},
          </h1>

          <div className="flex items-center gap-2">
            {/* Notifications bell */}
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) void fetchNotifications();
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Open notifications"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-buttons shadow-sm transition hover:bg-green-50"
                >
                  <IconComponent icon="bell" size={20} />
                  {/* Red dot for unread notifications */}
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-urgency-high" />
                  )}
                </button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader className="flex-row items-center justify-between space-y-0">
                  <DialogTitle>Notifications</DialogTitle>
                  <DialogClose
                    aria-label="Close notifications"
                    className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <IconComponent icon="x" size={20} />
                  </DialogClose>
                </DialogHeader>

                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  {loading && (
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                  )}

                  {!loading && error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                  )}

                  {!loading && !error && notifications.length === 0 && (
                    <p className="text-sm text-gray-500">No notifications yet.</p>
                  )}

                  {!loading && !error && notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-brand-text-titles">{n.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                      {n.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDateTime(n.createdAt)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Scan Prompt Card ────────────────────────────────────────────── */}
        <CheckCocoaCard />

        {/* ── Recent Scans ────────────────────────────────────────────────── */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-brand-text-titles">Previous Scans</h2>
            {recentScans.length > 0 && (
              <Link
                href={ROUTES.HISTORY}
                className="text-sm font-medium text-brand-buttons hover:underline"
              >
                View more
              </Link>
            )}
          </div>

          {recentScans.length === 0 && (
            <p className="text-sm text-brand-sub-text">No scans yet. Tap the scan button to get started.</p>
          )}

          {recentScans.map((scan) => (
            <DiseaseCard
              key={scan.id}
              id={scan.id}
              name={scan.name}
              urgency={scan.urgency}
              image={scan.image}
              urgencyClass={scan.urgencyClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}