'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiUser } from 'react-icons/fi';



export default function ContactClient() {
  const searchParams = useSearchParams();
  const scanIdParam = searchParams.get('scan_id');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const formData = new FormData(form);
    const subject = String(formData.get('subject') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    const scan_id = scanIdParam ? Number(scanIdParam) : undefined;

    setSubmitting(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id,
          subject,
          description,
        }),
      });

      if (!res.ok) {
        alert('Failed to send message.');
        return;
      }

      alert("Your message has been sent! We'll get back to you soon.");
      form?.reset?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
       

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between py-4 mb-6">
          <Link
            href={scanIdParam ? `/results/${scanIdParam}` : '/results/unknown'}
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Contact Expert</h1>
          <div className="w-9"></div>
        </div>

        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-brand-text-titles mb-2">Get Expert Help</h2>
            <p className="text-brand-sub-text font-normal">
              Our agricultural experts are here to help you identify and treat your cocoa diseases.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-sub-titles font-semibold mb-2">Subject</label>
              <input
                name="subject"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="What do you need help with?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles font-semibold mb-2">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Please describe what you're seeing on your cocoa plants..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 mt-6 disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-brand-sub-text font-normal">We typically respond within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
