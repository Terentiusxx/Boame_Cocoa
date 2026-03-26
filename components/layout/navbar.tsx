'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/home') return pathname === '/home'
  if (href === '/messages') return pathname === '/messages' || pathname.startsWith('/messages/')
  if (href === '/learn') return pathname === '/learn' || pathname.startsWith('/learn/')
  if (href === '/settings') return pathname === '/settings' || pathname.startsWith('/settings/')
  return pathname === href
}

function IconHome(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21a1 1 0 0 0 1 1h4v-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function IconUsers(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-1a3 3 0 0 0-2.5-3" />
      <path d="M16.5 3.5a3 3 0 0 1 0 6" />
    </svg>
  )
}

function IconBook(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
    </svg>
  )
}

function IconUser(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="12" cy="7" r="3" />
    </svg>
  )
}

function IconScan(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7h-3l-2-3H9L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

function NavIconButton(props: {
  href: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={props.href}
      aria-label={props.label}
      className={
        'w-11 h-11 rounded-full flex items-center justify-center transition-all no-underline active:scale-95 ' +
        (props.active
          ? 'bg-white shadow-card text-brand-buttons'
          : 'text-gray-500 hover:text-gray-800 hover:bg-white/70')
      }
    >
      {props.children}
    </Link>
  )
}

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background z-50">
      <div className="max-w-mobile mx-auto px-6 pb-5">
        <nav className="relative bg-background border border-gray-100 rounded-2xl shadow-nav-shadow px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavIconButton href="/home" label="Home" active={isActive(pathname, '/home')}>
                <IconHome className="w-6 h-6" />
              </NavIconButton>

              <NavIconButton href="/messages" label="Messages" active={isActive(pathname, '/messages')}>
                <IconUsers className="w-6 h-6" />
              </NavIconButton>
            </div>

            <div className="flex items-center gap-3">
              <NavIconButton href="/learn" label="Learn" active={isActive(pathname, '/learn')}>
                <IconBook className="w-6 h-6" />
              </NavIconButton>

              <NavIconButton href="/settings" label="Settings" active={isActive(pathname, '/settings')}>
                <IconUser className="w-6 h-6" />
              </NavIconButton>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <Link
              href="/scan"
              aria-label="Scan"
              className="w-16 h-16 bg-brand-buttons rounded-full flex items-center justify-center shadow-scan-button transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-buttons focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <IconScan className="w-7 h-7 text-white" />
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )
}