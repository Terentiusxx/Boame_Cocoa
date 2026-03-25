'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import Navbar from '@/components/layout/navbar'

const HIDE_NAV_ROUTES = new Set<string>([
  '/splash',
  '/login',
  '/signin',
  '/signup',
  '/create-account',
  '/forgot-password',
  '/scan',
  '/processing',
])

export default function ConditionalNavbar() {
  const pathname = usePathname()
  const shouldShow = pathname ? !HIDE_NAV_ROUTES.has(pathname) : true

  useEffect(() => {
    if (!shouldShow) return

    document.body.dataset.hasNav = 'true'
    return () => {
      delete document.body.dataset.hasNav
    }
  }, [shouldShow])

  if (!shouldShow) return null

  return <Navbar />
}
