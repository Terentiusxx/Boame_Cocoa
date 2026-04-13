/**
 * ContactFormClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Consultation request form. Receives expert details as props
 * from the server component — only does the POST (consultation submit).
 *
 * Server fetches (in app/contact/form/page.tsx):
 *   GET /experts/:id → expert prop
 *
 * Client mutations:
 *   POST /consultations — submit consultation request
 */
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { extractErrorMessage } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type Expert = {
  expert_id: number;
  first_name: string;
  last_name: string;
  specialization?: string;
} | null;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactFormClient({
  expert,
  expertId,
  scanId,
}: {
  expert: Expert;
  expertId?: string;
  scanId?: string;
}) {
  const router = useRouter();

  const [subject,     setSubject]     = useState('');
  const [description, setDescription] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Please describe what you need help with.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expert_id:   expertId ? Number(expertId) : undefined,
          scan_id:     scanId   ? Number(scanId)   : undefined,
          subject:     subject.trim() || 'Expert help request',
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(extractErrorMessage(payload, 'Failed to send request. Please try again.'));
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-brand-text-titles mb-3">Request Sent!</h2>
        <p className="text-brand-sub-text mb-8 max-w-xs">
          {expert ? `${expert.first_name} ${expert.last_name}` : 'The expert'} will get back to you shortly.
        </p>
        <Link
          href={ROUTES.MESSAGES}
          className="block w-full rounded-brand bg-brand-buttons py-4 text-center text-base font-semibold text-white hover:opacity-90 transition"
        >
          View Messages
        </Link>
        <Link
          href={ROUTES.HOME}
          className="block w-full mt-3 py-3 text-center text-brand-hyperlink text-sm font-medium hover:underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 flex flex-col min-h-screen">

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
          <h1 className="text-xl font-semibold text-brand-text-titles">Contact Expert</h1>
          <div className="w-9" />
        </div>

        {/* Expert name — rendered from server-fetched prop, no loading state */}
        {expert && (
          <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-brand-text-titles">
            Sending to: <strong>{expert.first_name} {expert.last_name}</strong>
            {expert.specialization && (
              <span className="text-brand-sub-text"> · {expert.specialization}</span>
            )}
          </div>
        )}

        {scanId && (
          <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-gray-600">
            This consultation will be linked to your recent scan.
          </div>
        )}

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Black pod disease on my farm"
              disabled={loading}
              className="w-full rounded-brand border border-gray-200 bg-white px-4 py-3 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you are seeing on your cocoa plants..."
              rows={6}
              disabled={loading}
              className="w-full flex-1 rounded-brand border border-gray-200 bg-white px-4 py-3 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 resize-none"
            />
          </div>

          <button
            id="contact-form-submit"
            type="submit"
            disabled={loading}
            className="mb-8 w-full rounded-brand bg-brand-buttons py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
