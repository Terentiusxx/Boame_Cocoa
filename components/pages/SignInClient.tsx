'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

 

export default function SignInClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        setError(payload?.detail ?? payload?.message ?? 'Login failed')
        return
      }

      router.replace('/home')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
       

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
            <h1 className="text-3xl font-bold text-brand-text-titles mb-2">Login</h1>
            <p className="text-brand-sub-text text-lg">Welcome Back!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your email"
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
                required
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="text-left">
              <Link
                href="/forgot-password"
                className="text-brand-hyperlink underline cursor-pointer hover:opacity-80 text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90 mt-8 text-lg disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-brand-sub-text font-normal">
              Don&apos;t have an account?{' '}
              <Link
                href="/create-account"
                className="text-brand-hyperlink underline cursor-pointer hover:opacity-80 font-semibold"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
