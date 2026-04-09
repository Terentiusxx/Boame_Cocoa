'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  type: 'protected' | 'public'; // protected = requires auth, public = login/signup pages
}

export default function AuthGuard({ children, type }: AuthGuardProps) {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
        });

        const payload = await response.json().catch(() => null);
        const isAuthenticated = response.ok && payload?.authenticated === true;

        if (type === 'protected' && !isAuthenticated) {
          router.replace('/login');
          return;
        }

        if (type === 'public' && isAuthenticated) {
          router.replace('/home');
          return;
        }

        setIsChecked(true);
      } catch {
        // Network error or incomplete check
        if (type === 'protected') {
          router.replace('/login');
        } else {
          setIsChecked(true);
        }
      }
    };

    checkAuth();
  }, [router, type]);

  if (!isChecked) {
    return null;
  }

  return <>{children}</>;
}
