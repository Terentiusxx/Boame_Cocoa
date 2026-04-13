/**
 * ExpertAuthGuard.tsx
 * ─────────────────────────────────────────────────────────────
 * Client-side auth guard for the expert portal.
 * Checks expert session and redirects to /expert/login if unauthenticated.
 * Shows a spinner while checking — prevents content flash.
 *
 * Usage: Wrap expert page client components that require authentication.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EXPERT_ROUTES } from '@/lib/constants';

export default function ExpertAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch('/api/expert-auth/session', { cache: 'no-store' });
        if (!cancelled && !res.ok) {
          router.replace(EXPERT_ROUTES.LOGIN);
        }
      } catch {
        if (!cancelled) router.replace(EXPERT_ROUTES.LOGIN);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    void check();
    return () => { cancelled = true; };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
