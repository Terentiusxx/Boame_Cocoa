/**
 * app/expert/login/page.tsx + ExpertLoginClient.tsx
 * Expert portal sign-in page.
 * Uses /api/expert-auth/login which validates expert_id exists.
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
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 focus:bg-white text-sm';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Green header */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-8 pt-10 pb-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white" />
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 14.5v-5l-2 2-1.4-1.4L12 7.6l4.4 4.5-1.4 1.4-2-2v5h-2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Expert Portal</h1>
              <p className="text-green-100 text-sm">Boame Cocoa — Expert Access</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="expert-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  id="expert-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="expert-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="expert-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="expert-login-btn"
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95 disabled:opacity-60 mt-2"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-500">
                New expert?{' '}
                <Link href={EXPERT_ROUTES.REGISTER} className="text-green-600 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
              <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition">
                ← Back to User App
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
