/**
 * ExpertConsultationDetailClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Consultation detail view for the expert.
 * Shows farmer's request, linked scan info, and action buttons
 * (Accept → In Progress, Resolve).
 *
 * Server fetches (in app/expert/consultations/[id]/page.tsx):
 *   GET /experts/consultations/:id → consultation prop
 *
 * Client mutations (PATCH):
 *   /api/experts/my-consultations/:id { action: 'accept' | 'resolve' }
 *
 * Design matches the user-side inner-screen pattern.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiMessageCircle, FiSend, FiUser } from 'react-icons/fi';
import { formatDateTime, extractErrorMessage } from '@/lib/utils';
import { EXPERT_ROUTES } from '@/lib/constants';
import ExpertNavbar from '@/components/expert/ExpertNavbar';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConsultDetail = {
  consult_id: number; user_id: number; scan_id?: number; expert_id: number;
  subject: string; description?: string; priority: string;
  status: string; created_at: string; updated_at: string; resolution_note?: string;
} | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Open:        'bg-orange-50 text-orange-700 border-orange-200',
  In_Progress: 'bg-blue-50 text-blue-700 border-blue-200',
  Resolved:    'bg-green-50 text-green-700 border-green-200',
  Closed:      'bg-gray-50 text-gray-500 border-gray-200',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs text-brand-sub-text w-24 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpertConsultationDetailClient({
  consultation,
  consultId,
}: {
  consultation: ConsultDetail;
  consultId: string;
}) {
  const router = useRouter();
  const [status,          setStatus]          = useState(consultation?.status ?? 'Open');
  const [actionLoading,   setActionLoading]   = useState<'accept' | 'resolve' | null>(null);
  const [resolutionNote,  setResolutionNote]  = useState(consultation?.resolution_note ?? '');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [diagnosis,       setDiagnosis]       = useState('');
  const [confidence,      setConfidence]      = useState<'Low' | 'Mid' | 'High'>('Mid');
  const [treatment,       setTreatment]       = useState('');
  const [expertNotes,     setExpertNotes]     = useState('');
  const [error,           setError]           = useState<string | null>(null);

  const doAction = async (action: 'accept' | 'resolve') => {
    setError(null);
    setActionLoading(action);
    try {
      const res = await fetch(`/api/experts/my-consultations/${consultId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...(action === 'resolve' ? { resolution_note: resolutionNote } : {}) }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as Record<string, unknown> | null;
        setError(extractErrorMessage(payload, `Failed to ${action} consultation.`));
        return;
      }

      if (action === 'accept')  setStatus('In_Progress');
      if (action === 'resolve') setStatus('Resolved');
      setShowResolveForm(false);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed.'));
    } finally {
      setActionLoading(null);
    }
  };

  const submitDiagnosis = async () => {
    const primaryObservation = diagnosis.trim();
    const prescribedTreatment = treatment.trim();
    const notes = expertNotes.trim();

    if (!primaryObservation) {
      setError('Please provide a primary observation before submitting.');
      return;
    }

    setError(null);
    setActionLoading('accept');

    const messageContent =
      `Primary Observation: ${primaryObservation}\n` +
      `Confidence Level: ${confidence}\n` +
      `${prescribedTreatment ? `Prescribed Treatment: ${prescribedTreatment}\n` : ''}` +
      `${notes ? `Expert Notes: ${notes}` : ''}`.trim();

    try {
      const acceptRes = await fetch(`/api/experts/my-consultations/${consultId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', message: messageContent }),
      });

      if (!acceptRes.ok) {
        const payload = await acceptRes.json().catch(() => null) as Record<string, unknown> | null;
        setError(extractErrorMessage(payload, 'Failed to accept consultation.'));
        return;
      }

      const msgRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultation_id: Number(consultId),
          content: messageContent,
          message_type: 'text',
        }),
      });

      if (!msgRes.ok) {
        const payload = await msgRes.json().catch(() => null) as Record<string, unknown> | null;
        setError(extractErrorMessage(payload, 'Consultation accepted, but failed to send expert response.'));
        setStatus('In_Progress');
        return;
      }

      setStatus('In_Progress');
      setDiagnosis('');
      setTreatment('');
      setExpertNotes('');
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed.'));
    } finally {
      setActionLoading(null);
    }
  };

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!consultation) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background shadow-mobile flex flex-col items-center justify-center px-8 text-center">
        <p className="text-brand-sub-text mb-4">Consultation not found.</p>
        <button
          type="button"
          onClick={() => router.replace(EXPERT_ROUTES.CONSULTATIONS)}
          className="rounded-brand bg-brand-buttons px-6 py-3 text-white font-semibold text-sm hover:opacity-90 transition"
        >
          ← Back to Consultations
        </button>
      </div>
    );
  }

  const statusStyle  = STATUS_COLOR[status] ?? STATUS_COLOR.Open!;
  const isOpen       = status === 'Open';
  const isInProgress = status === 'In_Progress';

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile pb-10">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <button
          type="button"
          onClick={() => router.replace(EXPERT_ROUTES.CONSULTATIONS)}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
        >
          <FiArrowLeft size={18} />
        </button>

        <h1 className="text-base font-bold text-brand-text-titles">Consultation</h1>

        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}>
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* ── Subject ──────────────────────────────────────────────────── */}
      <div className="px-5 mb-5">
        <p className="text-lg font-bold text-brand-text-titles leading-snug line-clamp-3">
          {consultation.subject}
        </p>
      </div>

      <div className="px-5 space-y-4">

        {/* Error */}
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Metadata card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-5 py-2">
          <InfoRow label="Farmer ID"    value={<div className="flex items-center gap-1"><FiUser size={12} /> #{consultation.user_id}</div>} />
          <InfoRow label="Priority"     value={<span className="font-bold">{consultation.priority}</span>} />
          <InfoRow label="Opened"       value={formatDateTime(consultation.created_at)} />
          <InfoRow label="Last Updated" value={formatDateTime(consultation.updated_at)} />
          {consultation.scan_id && (
            <InfoRow label="Scan ID" value={`#${consultation.scan_id}`} />
          )}
        </div>

        {/* Description */}
        {consultation.description && (
          <div>
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-2">Farmer{`'`}s Message</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-5 py-4">
              <p className="text-sm text-gray-700 leading-relaxed">{consultation.description}</p>
            </div>
          </div>
        )}

        {/* Resolution note (if resolved) */}
        {consultation.resolution_note && status === 'Resolved' && (
          <div>
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-2">Resolution Note</h2>
            <div className="bg-green-50 rounded-2xl border border-green-100 px-5 py-4">
              <p className="text-sm text-green-800 leading-relaxed">{consultation.resolution_note}</p>
            </div>
          </div>
        )}

        {/* Resolve form */}
        {showResolveForm && isInProgress && (
          <div>
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest mb-2">Resolution Note</h2>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={4}
              placeholder="Summarise the advice you gave the farmer..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 resize-none"
            />
          </div>
        )}

        {/* Open consultation diagnosis form */}
        {isOpen && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-4">
            <h2 className="text-xs font-bold text-brand-sub-text uppercase tracking-widest">Expert Diagnosis</h2>

            <div>
              <label htmlFor="primary-observation" className="text-xs font-semibold text-gray-700 mb-2 block">
                Primary Observation (Disease Name)
              </label>
              <input
                id="primary-observation"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g., Black Pod Rot"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Expert Confidence Level</p>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Mid', 'High'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setConfidence(level)}
                    className={`rounded-full border px-3 py-3 text-sm font-semibold transition ${
                      confidence === level
                        ? 'bg-primary-green/15 border-primary-green text-primary-green'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="prescribed-treatment" className="text-xs font-semibold text-gray-700 mb-2 block">
                Prescribed Treatment
              </label>
              <textarea
                id="prescribed-treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                rows={4}
                placeholder="Describe the steps required for containment and remediation..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 resize-none"
              />
            </div>

            <div>
              <label htmlFor="expert-notes" className="text-xs font-semibold text-gray-700 mb-2 block">
                Expert Notes
              </label>
              <textarea
                id="expert-notes"
                value={expertNotes}
                onChange={(e) => setExpertNotes(e.target.value)}
                rows={3}
                placeholder="Contextual observations (weather, soil moisture, etc.)"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => void submitDiagnosis()}
              disabled={!!actionLoading}
              className="w-full flex items-center justify-center gap-2 rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95 disabled:opacity-60"
            >
              <FiSend size={18} />
              {actionLoading === 'accept' ? 'Submitting…' : 'Submit Diagnosis'}
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          {isInProgress && !showResolveForm && (
            <button
              type="button"
              onClick={() => setShowResolveForm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95"
            >
              <FiCheck size={18} />
              Mark as Resolved
            </button>
          )}

          {showResolveForm && isInProgress && (
            <>
              <button
                type="button"
                onClick={() => void doAction('resolve')}
                disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95 disabled:opacity-60"
              >
                <FiCheck size={18} />
                {actionLoading === 'resolve' ? 'Resolving…' : 'Confirm Resolution'}
              </button>
              <button
                type="button"
                onClick={() => setShowResolveForm(false)}
                className="w-full py-3 text-center text-sm text-brand-sub-text hover:text-gray-600 transition"
              >
                Cancel
              </button>
            </>
          )}

          {/* Message thread link */}
          <Link
            href={`/messages/${consultation.consult_id}`}
            className="flex items-center justify-center gap-2 w-full rounded-brand bg-gray-100 border border-gray-200 py-4 text-gray-800 font-semibold text-base hover:bg-gray-200 transition active:scale-95"
          >
            <FiMessageCircle size={18} />
            Open Message Thread
          </Link>
        </div>
      </div>

      <ExpertNavbar />
    </div>
  );
}
