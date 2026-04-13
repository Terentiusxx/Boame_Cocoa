/**
 * serverAPI.ts
 * ─────────────────────────────────────────────────────────────
 * Server-side data fetching helper for Next.js Server Components (RSC).
 *
 * Use `serverApi<T>(path, init?)` in async Server Components to fetch data
 * directly from the backend during SSR — no client-side round-trip needed.
 *
 * This is different from backendProxy.ts (which is used in API Route handlers).
 * Here we throw on error so Server Components can catch and handle gracefully.
 */

import { cookies } from 'next/headers';
import { isDev, getMockResponse } from './devMode';
import { COOKIE_NAME } from './constants';

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Resolve the backend base URL, with ngrok auto-upgrade.
 * Shared logic with backendProxy.ts but kept here to avoid circular deps.
 */
function requireApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) throw new Error('NEXT_PUBLIC_API_URL is not set.');

  const trimmed = raw.trim().replace(/\/+$/, '');

  try {
    const url = new URL(trimmed);
    const isNgrok = /(^|\.)ngrok(-free)?\.app$/i.test(url.hostname);
    if (isNgrok && url.protocol === 'http:') {
      url.protocol = 'https:';
      return url.toString().replace(/\/+$/, '');
    }
  } catch { /* fallthrough */ }

  return trimmed;
}

/**
 * Validate that a path segment doesn't contain undefined/null/NaN values,
 * which would silently create invalid routes like "/history/undefined".
 */
function assertValidPath(path: string): void {
  if (!path.startsWith('/')) {
    throw new Error(`serverApi: path must start with '/' — got: "${path}"`);
  }
  if (/\/(undefined|null|NaN)(?=\/|\?|$)/.test(path)) {
    throw new Error(`serverApi: path contains invalid segment — got: "${path}"`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch a backend endpoint from a Server Component and return typed data.
 * Throws on HTTP errors so the caller can decide how to handle (try/catch).
 *
 * In dev mode, returns mock data from devMode.ts instead of hitting the network.
 *
 * Generic <T> is the expected shape of the backend's response body.
 *
 * @example
 * // In a Server Component:
 * const user = await serverApi<User>('/users/me')
 */
export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  assertValidPath(path);

  // ── Dev mode: serve from mock data ───────────────────────────────────────
  if (isDev()) {
    const method = init?.method ?? 'GET';

    let body: unknown;
    if (typeof init?.body === 'string') {
      try { body = JSON.parse(init.body); } catch { /* leave undefined */ }
    }

    const mock = getMockResponse(path, method, body);

    if (!mock) {
      throw new Error(`[DEV] No mock data for ${method} ${path}`);
    }
    if (mock.error) {
      throw new Error(mock.error);
    }

    console.log(`[DEV] serverApi ${method} ${path}`, mock.data);
    return mock.data as T;
  }

  // ── Production: call real backend ─────────────────────────────────────────
  const baseUrl = requireApiUrl();
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  const headers = new Headers(init?.headers);

  // Inject bearer token if present
  if (token && !headers.has('Authorization')) {
    const trimmed = token.trim();
    headers.set(
      'Authorization',
      /^bearer\s+/i.test(trimmed) ? trimmed : `Bearer ${trimmed}`
    );
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store', // Server Components: never serve stale data
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}