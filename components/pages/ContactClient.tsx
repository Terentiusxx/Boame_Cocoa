'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

export default function ContactClient() {
  const searchParams = useSearchParams();
  const scanIdParam = searchParams.get('scan_id');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const issue = String(formData.get('issue') ?? '').trim();

    const scan_id = scanIdParam ? Number(scanIdParam) : undefined;

    setSubmitting(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id,
          contact_name: name,
          contact_email: email,
          message: `Phone: ${phone}\n\n${issue}`,
          priority: 'medium',
        }),
      });

      if (!res.ok) {
        alert('Failed to send message.');
        return;
      }

      alert("Your message has been sent! We'll get back to you soon.");
      e.currentTarget.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

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
              <span className="text-2xl">👨‍🌾</span>
            </div>
            <h2 className="text-xl font-semibold text-brand-text-titles mb-2">Get Expert Help</h2>
            <p className="text-brand-sub-text font-normal">
              Our agricultural experts are here to help you identify and treat your cocoa diseases.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-sub-titles font-semibold mb-2">Your Name</label>
              <input
                name="name"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles font-semibold mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles font-semibold mb-2">Phone Number</label>
              <input
                name="phone"
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles font-semibold mb-2">Describe the Issue</label>
              <textarea
                name="issue"
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
