/**
 * ExpertNavbar.tsx
 * ─────────────────────────────────────────────────────────────
 * Bottom navigation bar for the expert portal.
 * Styled to match the user navbar (components/layout/navbar.tsx).
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FiActivity, FiClipboard, FiMessageCircle } from 'react-icons/fi';

import IconComponent from '@/components/IconComponent';
import { ICON_MAP } from '@/lib/icons';
import { EXPERT_ROUTES } from '@/lib/constants';

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === EXPERT_ROUTES.DASHBOARD) return pathname === EXPERT_ROUTES.DASHBOARD;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={
        'w-11 h-11 rounded-full flex items-center justify-center transition-all no-underline active:scale-95 ' +
        (active ? 'text-black scale-110 font-semibold' : 'text-gray-500 hover:text-gray-800')
      }
    >
      {children}
    </Link>
  );
}

export default function ExpertNavbar() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.dataset.hasNav = 'true';
    return () => {
      delete document.body.dataset.hasNav;
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background z-50">
      <div className="max-w-mobile mx-auto px-6 pb-5">
        <nav className="relative bg-background rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <NavItem
              href={EXPERT_ROUTES.DASHBOARD}
              label="Requests"
              active={isActive(pathname, EXPERT_ROUTES.DASHBOARD)}
            >
              <FiClipboard size={24} />
            </NavItem>

            <NavItem
              href={EXPERT_ROUTES.CONSULTATIONS}
              label="Inbox"
              active={isActive(pathname, EXPERT_ROUTES.CONSULTATIONS)}
            >
              <FiMessageCircle size={24} />
            </NavItem>

            <button
              type="button"
              aria-label="Diagnose (coming soon)"
              className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 cursor-not-allowed"
              disabled
            >
              <FiActivity size={24} />
            </button>

            <NavItem
              href={EXPERT_ROUTES.PROFILE}
              label="Settings"
              active={isActive(pathname, EXPERT_ROUTES.PROFILE)}
            >
              <IconComponent icon={ICON_MAP.settings} size={24} />
            </NavItem>
          </div>
        </nav>
      </div>
    </div>
  );
}
