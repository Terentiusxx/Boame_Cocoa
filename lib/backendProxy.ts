import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const COOKIE_NAME = 'auth_token'

function requireApiUrl() {
  if (!API_URL) throw new Error('Missing API url (NEXT_PUBLIC_API_URL)')
  return API_URL.trim().replace(/\/+$/, '')
}

async function getToken() {
  return (await cookies()).get(COOKIE_NAME)?.value
}

export async function backendFetch(path: string, init?: RequestInit) {
  const baseUrl = requireApiUrl()
  const token = await getToken()

  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  })
}

export async function proxyBackendJson(req: Request, path: string, init?: RequestInit) {
  try {
    const res = await backendFetch(path, init)

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => null)
      return NextResponse.json(data ?? { message: 'Invalid JSON from backend' }, {
        status: res.status,
      })
    }

    const text = await res.text().catch(() => '')
    return NextResponse.json(
      text ? { message: text } : { message: res.ok ? 'OK' : 'Request failed' },
      { status: res.status }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Proxy failed' },
      { status: 500 }
    )
  }
}
