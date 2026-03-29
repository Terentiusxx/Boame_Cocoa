'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import IconComponent from '@/components/IconComponent'
import { ICON_MAP } from '@/lib/icons'

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/home') return pathname === '/home'
  if (href === '/messages') return pathname === '/messages' || pathname.startsWith('/messages/')
  if (href === '/learn') return pathname === '/learn' || pathname.startsWith('/learn/')
  if (href === '/settings') return pathname === '/settings' || pathname.startsWith('/settings/')
  return pathname === href
}

function IconScan(props: { className?: string }) {
  return (
    <IconComponent icon={ICON_MAP.camera} size={24} className="text-white"/>
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
          ? 'text-black scale-110 font-semibold'
          : 'text-gray-500 hover:text-gray-800')
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
        <nav className="relative bg-background rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavIconButton href="/home" label="Home" active={isActive(pathname, '/home')}>
                <IconComponent icon={ICON_MAP.home} size={24} />
              </NavIconButton>

              <NavIconButton href="/messages" label="Messages" active={isActive(pathname, '/messages')}>
                <IconComponent icon={ICON_MAP.messages} size={24} />
              </NavIconButton>
            </div>

            <div className="flex items-center gap-3">
              <NavIconButton href="/learn" label="Learn" active={isActive(pathname, '/learn')}>
                <IconComponent icon={ICON_MAP.learn} size={24} />
              </NavIconButton>

              <NavIconButton href="/settings" label="Settings" active={isActive(pathname, '/settings')}>
                <IconComponent icon={ICON_MAP.settings} size={24} />
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