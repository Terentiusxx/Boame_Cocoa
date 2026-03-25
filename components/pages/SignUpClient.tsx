'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function SignUpClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const parts = name.trim().split(/\s+/).filter(Boolean)
      const first_name = parts[0] ?? ''
      const last_name = parts.slice(1).join(' ') || 'User'

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          telephone: telephone.trim(),
          password,
        }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        const msg = toMessage((payload as any)?.detail ?? (payload as any)?.message ?? payload)
        setError(msg || 'Signup failed')
        return
      }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (loginRes.ok) {
        router.replace('/home')
      } else {
        router.replace('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="px-6 pb-6 flex flex-col h-full">
        <div className="flex items-center justify-between py-4 mb-8">
          <Link
            href="/splash"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <div className="flex-1"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-brand-text-titles mb-2">Create Account</h1>
            <p className="text-brand-sub-text font-normal text-lg">Fill in the details to sign up</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">
                Telephone Number
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your telephone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 mt-8 text-lg disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-brand-sub-text font-normal">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-brand-hyperlink underline cursor-pointer hover:opacity-80 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
