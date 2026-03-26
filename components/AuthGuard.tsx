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
    // Check if auth_token cookie exists by making a simple request to /api/users/me
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me', { method: 'GET' });
        const isAuthenticated = response.ok;

        if (type === 'protected' && !isAuthenticated) {
          // User not logged in, trying to access protected route
          router.replace('/login');
          return;
        }

        if (type === 'public' && isAuthenticated) {
          // User logged in, trying to access login/signup page
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
    return null; // Or loading spinner if needed
  }

  return <>{children}</>;
}
