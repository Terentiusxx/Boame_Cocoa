import { cookies } from 'next/headers'
import { isDev, getMockResponse } from './devMode'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const COOKIE_NAME = 'auth_token'

function requireApiUrl() {
  if (!API_URL) throw new Error('Missing API url')
  const trimmed = API_URL.trim().replace(/\/+$/, '')

  try {
    const url = new URL(trimmed)
    const isNgrok = /(^|\.)ngrok(-free)?\.app$/i.test(url.hostname)
    if (isNgrok && url.protocol === 'http:') {
      url.protocol = 'https:'
      return url.toString().replace(/\/+$/, '')
    }
  } catch {
    // ignore invalid URL; fallback to trimmed
  }

  return trimmed
}

function assertValidPath(path: string) {
  if (!path.startsWith('/')) {
    throw new Error(`serverApi path must start with '/': ${path}`)
  }
  if (/\/(undefined|null|NaN)(?=\/|\?|$)/.test(path)) {
    throw new Error(`serverApi path contains invalid segment: ${path}`)
  }
}

export async function serverApi<T>(path: string, init?: RequestInit) {
  assertValidPath(path)

  // Dev mode: use hardcoded data instead of backend
  if (isDev()) {
    const method = init?.method || 'GET'
    let body: unknown = undefined
    if (typeof init?.body === 'string') {
      try {
        body = JSON.parse(init.body)
      } catch {
        body = undefined
      }
    }
    const mockResponse = getMockResponse(path, method, body)
    
    if (mockResponse) {
      if (!mockResponse.error) {
        console.log(`[DEV MODE] ${method} ${path}`, mockResponse.data)
        return mockResponse.data as T
      } else {
        throw new Error(mockResponse.error)
      }
    }
    // If no mock found, throw error
    throw new Error(`[DEV MODE] No mock data for ${method} ${path}`)
  }

  // Production: use real backend
  const baseUrl = requireApiUrl()
  const token = (await cookies()).get(COOKIE_NAME)?.value

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }

  return (await res.json()) as T
}