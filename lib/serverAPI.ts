import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const COOKIE_NAME = 'auth_token'

export async function serverApi<T>(path: string, init?: RequestInit) {
  if (!API_URL) throw new Error('Missing API url')

  const token = (await cookies()).get(COOKIE_NAME)?.value

  const res = await fetch(`${API_URL}${path}`, {
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