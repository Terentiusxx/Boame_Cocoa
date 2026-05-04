/**
 * MessagesAuthGuard
 * ─────────────────────────────────────────────────────────────
 * Messaging pages are shared between users and experts.
 * This guard allows either session type to access /messages.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function MessagesAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const userRes = await fetch('/api/auth/session', { cache: 'no-store' });
        const userPayload = await userRes.json().catch(() => null) as { authenticated?: boolean } | null;
        const userOk = userRes.ok && userPayload?.authenticated === true;

        if (cancelled) return;
        if (userOk) {
          setReady(true);
          return;
        }

        const expertRes = await fetch('/api/expert-auth/session', { cache: 'no-store' });
        const expertPayload = await expertRes.json().catch(() => null) as { authenticated?: boolean } | null;
        const expertOk = expertRes.ok && expertPayload?.authenticated === true;

        if (cancelled) return;
        if (expertOk) {
          setReady(true);
          return;
        }

        router.replace(ROUTES.LOGIN);
      } catch {
        if (!cancelled) router.replace(ROUTES.LOGIN);
      }
    };

    void check();
    return () => { cancelled = true; };
  }, [router]);

  if (!ready) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
