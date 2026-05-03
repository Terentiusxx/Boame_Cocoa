/**
 * AuthGuard.tsx
 * ─────────────────────────────────────────────────────────────
 * Client-side auth check that wraps protected pages.
 *
 * type="protected" — redirects to /login if not authenticated
 * type="public"    — redirects to /home if already authenticated (login/signup pages)
 *
 * Shows a loading spinner while checking, preventing the content flash
 * that would occur if we returned null.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/lib/constants';

interface AuthGuardProps {
  children: React.ReactNode;
  type: 'protected' | 'public';
}

export default function AuthGuard({ children, type }: AuthGuardProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const payload = await res.json().catch(() => null) as { authenticated?: boolean } | null;
        const isAuthenticated = res.ok && payload?.authenticated === true;

        if (cancelled) return;

        if (type === 'protected' && !isAuthenticated) {
          router.replace(ROUTES.LOGIN);
          return;
        }

        if (type === 'public' && isAuthenticated) {
          router.replace(ROUTES.HOME);
          return;
        }

        setIsReady(true);
      } catch {
        if (cancelled) return;
        // On network error: protect pages → redirect to login; public pages → show anyway
        if (type === 'protected') {
          router.replace(ROUTES.LOGIN);
        } else {
          setIsReady(true);
        }
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, [router, type]);

  // Show a spinner while auth is being checked — prevents content flash
  if (!isReady) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
