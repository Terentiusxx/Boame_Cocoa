/**
 * navbar.tsx
 * ─────────────────────────────────────────────────────────────
 * Bottom navigation bar shown on all main app pages.
 * The centre scan button floats above the bar.
 *
 * Rendered by ConditionalNavbar in layout.tsx — do NOT import this
 * directly into individual page components.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUsers } from 'react-icons/fi';
import IconComponent from '@/components/IconComponent';
import { ICON_MAP } from '@/lib/icons';
import { ROUTES } from '@/lib/constants';

/**
 * Determine if a nav item is active based on the current pathname.
 * Exact match for home; prefix match for sections with sub-pages.
 */
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === ROUTES.HOME) return pathname === ROUTES.HOME;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Individual nav icon button */
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

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background z-50">
      <div className="max-w-mobile mx-auto px-6 pb-5">
        <nav className="relative bg-background rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side: Home + Experts */}
            <div className="flex items-center gap-3">
              <NavItem href={ROUTES.HOME} label="Home" active={isActive(pathname, ROUTES.HOME)}>
                <IconComponent icon={ICON_MAP.home} size={24} />
              </NavItem>

              <NavItem href={ROUTES.CONTACT} label="Experts" active={isActive(pathname, ROUTES.CONTACT)}>
                <FiUsers size={24} />
              </NavItem>
            </div>

            {/* Right side: Learn + Settings */}
            <div className="flex items-center gap-3">
              <NavItem href={ROUTES.LEARN} label="Learn" active={isActive(pathname, ROUTES.LEARN)}>
                <IconComponent icon={ICON_MAP.learn} size={24} />
              </NavItem>

              <NavItem href={ROUTES.SETTINGS} label="Settings" active={isActive(pathname, ROUTES.SETTINGS)}>
                <IconComponent icon={ICON_MAP.settings} size={24} />
              </NavItem>
            </div>
          </div>

          {/* Centre scan FAB — floats above the nav bar */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <Link
              href={ROUTES.SCAN}
              aria-label="Scan cocoa plant"
              className="w-16 h-16 bg-brand-buttons rounded-full flex items-center justify-center shadow-scan-button transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-buttons focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <IconComponent icon={ICON_MAP.camera} size={24} className="text-white" />
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}