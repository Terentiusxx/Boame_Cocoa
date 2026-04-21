/**
 * ExpertLoginClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Expert portal sign-in — same design language as the user SignInClient.
 * Uses /api/expert-auth/login which validates expert credentials.
 */
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { EXPERT_ROUTES } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/utils';

export default function ExpertLoginClient() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/expert-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = await res.json().catch(() => null) as Record<string, unknown> | null;

      if (!res.ok) {
        setError(extractErrorMessage(payload, 'Invalid credentials. Please try again.'));
        return;
      }

      router.replace(EXPERT_ROUTES.DASHBOARD);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Check your internet and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 flex flex-col h-full min-h-screen">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="pt-14 pb-10 text-center">
          <h1 className="text-3xl font-bold text-brand-text-titles mb-2">Welcome Back</h1>
          <p className="text-brand-sub-text">Sign in to your expert account</p>
        </div>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5" noValidate>

          {/* Error */}
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="expert-email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="expert-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-brand border border-gray-200 bg-white px-4 py-3 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="expert-password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="expert-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-brand border border-gray-200 bg-white px-4 py-3 pr-12 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
                disabled={loading}
                required
              />
              <button
                type="button"
                aria-label={showPass ? 'Hide password' : 'Show password'}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="expert-login-btn"
            type="submit"
            disabled={loading}
            className="w-full rounded-brand bg-brand-buttons py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="py-8 text-center space-y-3">
          <p className="text-sm text-brand-sub-text">
            New expert?{' '}
            <Link href={EXPERT_ROUTES.REGISTER} className="font-semibold text-brand-hyperlink hover:underline">
              Create an account
            </Link>
          </p>
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition block">
            ← Back to User App
          </Link>
        </div>

      </div>
    </div>
  );
}
