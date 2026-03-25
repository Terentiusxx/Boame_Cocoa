'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  )
}

type MeResponse = {
  data?: {
    first_name?: string
    mid_name?: string
    last_name?: string
    email?: string
    telephone?: string
    role?: string
  }
  first_name?: string
  mid_name?: string
  last_name?: string
  email?: string
  telephone?: string
  role?: string
}

function toMessage(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''

  if (Array.isArray(value)) {
    return value.map((v) => toMessage(v)).filter(Boolean).join(', ')
  }

  if (value instanceof Error) return value.message

  if (typeof value === 'object') {
    const anyValue = value as Record<string, unknown>
    if (typeof anyValue.message === 'string') return anyValue.message
    if (typeof anyValue.detail === 'string') return anyValue.detail
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  return String(value)
}

function normalizeRole(role: string): string {
  if (role.trim().toLowerCase() === 'customer') return 'Customer'
  return role
}

export default function EditProfileClient() {
  const router = useRouter()

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Ghana',
  })

  const [role, setRole] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resolved = useMemo(() => {
    const parts = profile.name.trim().split(/\s+/).filter(Boolean)

    if (parts.length === 0) {
      return { first_name: '', mid_name: '', last_name: 'User' }
    }

    if (parts.length === 1) {
      return { first_name: parts[0] ?? '', mid_name: '', last_name: 'User' }
    }

    if (parts.length === 2) {
      return { first_name: parts[0] ?? '', mid_name: '', last_name: parts[1] ?? 'User' }
    }

    return {
      first_name: parts[0] ?? '',
      mid_name: parts.slice(1, -1).join(' '),
      last_name: parts[parts.length - 1] ?? 'User',
    }
  }, [profile.name])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      const res = await fetch('/api/users/me', { method: 'GET' })
      if (!res.ok) return

      const payload = (await res.json().catch(() => null)) as MeResponse | null
      const u = payload?.data ?? payload
      if (!u || !mounted) return

      setProfile((p) => ({
        ...p,
        name: [u.first_name, u.mid_name, u.last_name].filter(Boolean).join(' '),
        email: u.email ?? '',
        phone: u.telephone ?? '',
      }))

      setRole(u.role ? normalizeRole(u.role) : null)
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: resolved.first_name,
          mid_name: resolved.mid_name,
          last_name: resolved.last_name,
          email: profile.email,
          telephone: profile.phone,
          ...(role ? { role: normalizeRole(role) } : {}),
        }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        const msg = toMessage((payload as any)?.detail ?? (payload as any)?.message ?? payload)
        setError(msg || 'Failed to update profile')
        return
      }

      setSuccess('Profile updated successfully')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm('Delete your account? This action cannot be undone.')
    if (!ok) return

    setError(null)
    setSuccess(null)
    setDeleting(true)

    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        const msg = toMessage((payload as any)?.detail ?? (payload as any)?.message ?? payload)
        setError(msg || 'Failed to delete account')
        return
      }

      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
      router.replace('/login')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link
            href="/settings"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Edit Profile</h1>
          <div className="w-9"></div>
        </div>

        <div className="px-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
          {success && <p className="text-sm text-brand-sub-text mt-4">{success}</p>}

          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 text-lg disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          <div className="mt-4">
            <button
              onClick={handleDelete}
              disabled={saving || deleting}
              className="w-full px-6 py-4 rounded-brand font-semibold text-lg border border-red-600 text-red-600 bg-transparent hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
