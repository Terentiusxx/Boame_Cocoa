'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Expert } from '@/lib/types';

type MaybeWrapped<T> = T | { data?: T };

function unwrapData<T>(value: MaybeWrapped<T> | null): T | null {
  if (!value) return null;
  if (typeof value === 'object' && 'data' in value) {
    return ((value as { data?: T }).data ?? null) as T | null;
  }
  return value as T;
}

function fullName(expert: Expert | null) {
  if (!expert) return 'Selected Expert';
  return [expert.first_name, expert.mid_name, expert.last_name].filter(Boolean).join(' ').trim() || 'Selected Expert';
}

export default function ContactFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const expertIdParam = searchParams.get('expert_id');
  const scanIdParam = searchParams.get('scan_id');

  const expertId = expertIdParam ? Number(expertIdParam) : NaN;

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExpert, setLoadingExpert] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadExperts = async () => {
      setLoadingExpert(true);
      try {
        const res = await fetch('/api/experts', { method: 'GET' });
        const payload = (await res.json().catch(() => null)) as MaybeWrapped<Expert[]> | null;
        const data = unwrapData<Expert[]>(payload);

        if (!mounted) return;
        setExperts(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoadingExpert(false);
      }
    };

    void loadExperts();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedExpert = useMemo(() => {
    if (!Number.isFinite(expertId) || expertId <= 0) return null;
    return experts.find((expert) => expert.expert_id === expertId) ?? null;
  }, [expertId, experts]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!Number.isFinite(expertId) || expertId <= 0) {
      alert('Please select an expert first.');
      router.replace('/contact');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const subject = String(formData.get('subject') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    const scanId = scanIdParam ? Number(scanIdParam) : undefined;

    setSubmitting(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: Number.isFinite(scanId) ? scanId : undefined,
          expert_id: expertId,
          subject,
          description,
        }),
      });

      const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;

      if (!res.ok) {
        alert('Failed to send your message. Please try again.');
        return;
      }

      const consultationId =
        Number(payload?.consultation_id ?? payload?.consult_id ?? (payload?.data as Record<string, unknown> | undefined)?.consultation_id ?? (payload?.data as Record<string, unknown> | undefined)?.consult_id ?? payload?.id);

      if (Number.isFinite(consultationId) && consultationId > 0) {
        router.push(`/messages/${consultationId}`);
      } else {
        router.push('/messages');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between py-4 mb-6">
          <Link
            href={`/contact${scanIdParam ? `?scan_id=${encodeURIComponent(scanIdParam)}` : ''}`}
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">&lt;</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Message Expert</h1>
          <div className="w-9"></div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-5">
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Selected Expert</p>
          <p className="text-base font-semibold text-brand-text-titles mt-1">
            {loadingExpert ? 'Loading...' : fullName(selectedExpert)}
          </p>
          <p className="text-sm text-brand-sub-text mt-1">{selectedExpert?.specialization || 'Cocoa Specialist'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-sub-titles mb-2">Subject</label>
            <input
              name="subject"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="What do you need help with?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-sub-titles mb-2">Description</label>
            <textarea
              name="description"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe what you are seeing on your cocoa plants..."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting || !Number.isFinite(expertId) || expertId <= 0}
            className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
