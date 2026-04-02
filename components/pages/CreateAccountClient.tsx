'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { IMAGE_UPLOAD } from '@/lib/constants'

function toMessage(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''

  if (Array.isArray(value)) {
    return value
      .map((v) => toMessage(v))
      .filter(Boolean)
      .join(', ')
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

export default function CreateAccountClient() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPickImage = async (file: File | undefined) => {
    setError(null)
    if (!file) return

    const acceptedFormats = IMAGE_UPLOAD.ACCEPTED_FORMATS as readonly string[]
    if (!acceptedFormats.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image')
      return
    }

    if (file.size > IMAGE_UPLOAD.MAX_SIZE) {
      setError('Image is too large (max 5MB)')
      return
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.onerror = () => reject(new Error('Failed to read image'))
      reader.readAsDataURL(file)
    })

    if (!dataUrl) {
      setError('Failed to read image')
      return
    }

    setImageFile(file)
    setImageUrl(dataUrl)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const parts = name.trim().split(/\s+/).filter(Boolean)
      const first_name = parts[0] ?? ''
      const last_name = parts.length >= 2 ? (parts[parts.length - 1] ?? 'User') : 'User'
      const mid_name = parts.length >= 3 ? parts.slice(1, -1).join(' ') : undefined

      if (!first_name) {
        setError('Please enter your full name')
        return
      }

      if (!city.trim() || !region.trim() || !country.trim()) {
        setError('Please enter your city, region, and country')
        return
      }

      if (!imageUrl) {
        setError('Please upload a profile image')
        return
      }

      const formData = new FormData()
      formData.append('first_name', first_name)
      if (mid_name) formData.append('mid_name', mid_name)
      formData.append('last_name', last_name)
      formData.append('email', email.trim())
      formData.append('telephone', telephone.trim())
      formData.append('city', city.trim())
      formData.append('region', region.trim())
      formData.append('country', country.trim())
      formData.append('latitude', '0')
      formData.append('longitude', '0')
      formData.append('image_url', imageUrl)
      formData.append('password', password)

      const response = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const msg = toMessage((payload as any)?.detail ?? (payload as any)?.message ?? payload)
        setError(msg || 'Signup failed')
        return
      }

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (loginResponse.ok) {
        router.replace('/home')
      } else {
        router.replace('/login')
      }
    } catch (err) {
      setError(toMessage(err) || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-6 flex flex-col h-full">
        <div className="flex items-center justify-between py-4 mb-8">
          <Link
            href="/login"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <div className="flex-1"></div>
        </div>

        <div className="flex-1 flex flex-col justify-start">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-brand-text-titles mb-2">Create Account</h1>
            <p className="text-brand-sub-text font-normal text-lg">Fill in the details to sign up</p>
          </div>

          <div className="bg-card-bg shadow-card rounded-brand p-6">
            <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Your Name</label>
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
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Email Address</label>
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
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="e.g. Accra"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="e.g. Greater Accra"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="e.g. Ghana"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Profile Image</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-brand-sub-text">No photo</span>
                  )}
                </div>

                <label className="bg-gray-100 hover:bg-white transition-all duration-200 text-brand-sub-titles px-4 py-3 rounded-xl cursor-pointer">
                  Upload photo
                  <input
                    type="file"
                    accept={IMAGE_UPLOAD.ACCEPTED_FORMATS.join(',')}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      void onPickImage(file)
                    }}
                  />
                </label>

                {imageUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('')
                      setImageFile(null)
                    }}
                    className="text-brand-hyperlink underline hover:opacity-80"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-brand-sub-text mt-2">JPG, PNG, or WebP • Max 5MB</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-sub-titles mb-3">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200 pr-12"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
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
          </div>

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
