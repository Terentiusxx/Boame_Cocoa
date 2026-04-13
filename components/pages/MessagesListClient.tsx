/**
 * MessagesListClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Displays the list of message threads. Receives threads as props
 * from the server component — no GET fetches here.
 *
 * Server fetches (in app/messages/page.tsx):
 *   GET /messages → threads prop
 */
'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiMessageCircle } from 'react-icons/fi';
import { formatDateTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type Thread = {
  thread_id: number;
  expert_id: number;
  last_message?: string;
  updated_at?: string;
  unread_count?: number;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessagesListClient({ threads }: { threads: Thread[] }) {
  const router = useRouter();

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
          <h1 className="text-xl font-semibold text-brand-text-titles">Messages</h1>
          <div className="w-9" />
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {threads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <FiMessageCircle size={48} className="text-gray-300" />
            <p className="text-sm text-gray-500">No messages yet.</p>
            <button
              type="button"
              onClick={() => router.push(ROUTES.CONTACT)}
              className="rounded-brand bg-brand-buttons px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Talk to an Expert
            </button>
          </div>
        )}

        {/* ── Thread List ─────────────────────────────────────────────────── */}
        {threads.length > 0 && (
          <div className="space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.thread_id}
                type="button"
                onClick={() => router.push(`/messages/${thread.thread_id}`)}
                className="w-full text-left bg-white rounded-brand p-4 shadow-card hover:shadow-card-hover transition flex items-center gap-3"
              >
                {/* Initials avatar — expert name not loaded here to keep it simple */}
                <div className="w-12 h-12 rounded-full bg-primary-green flex items-center justify-center text-white font-bold text-sm shrink-0">
                  E{thread.expert_id}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      Expert #{thread.expert_id}
                    </p>
                    {thread.updated_at && (
                      <p className="text-xs text-gray-400 shrink-0">
                        {formatDateTime(thread.updated_at)}
                      </p>
                    )}
                  </div>
                  {thread.last_message && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{thread.last_message}</p>
                  )}
                </div>

                {/* Unread badge */}
                {!!thread.unread_count && (
                  <span className="w-5 h-5 rounded-full bg-urgency-high text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {thread.unread_count > 9 ? '9+' : thread.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
