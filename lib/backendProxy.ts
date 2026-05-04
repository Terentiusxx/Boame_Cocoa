/**
 * backendProxy.ts
 * ─────────────────────────────────────────────────────────────
 * Server-side utilities for proxying requests to the FastAPI backend.
 *
 * Two public exports:
 *   - backendFetch(path, init?)  — raw fetch to backend, dev-mode aware
 *   - proxyBackendJson(req, path, init?) — wraps backendFetch for API routes,
 *     converting the backend response into a NextResponse.json()
 *
 * All API route files should use one of these two functions.
 * Never call the backend URL directly from API routes — go through here.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isDev, getMockResponse } from './devMode';
import { COOKIE_NAME, EXPERT_COOKIE_NAME } from './constants';

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Resolve and validate the backend API base URL from env.
 * Auto-upgrades ngrok http:// → https:// (common local dev setup).
 * Throws if NEXT_PUBLIC_API_URL is not set — fail fast rather than silently.
 */
function requireApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to your .env.local file.');

  const trimmed = raw.trim().replace(/\/+$/, ''); // strip trailing slashes

  try {
    const url = new URL(trimmed);
    // ngrok tunnels must use HTTPS — auto-upgrade if developer forgot
    const isNgrok = /(^|\.)ngrok(-free)?\.app$/i.test(url.hostname);
    if (isNgrok && url.protocol === 'http:') {
      url.protocol = 'https:';
      return url.toString().replace(/\/+$/, '');
    }
  } catch {
    // Not a valid URL — just return trimmed and let fetch fail naturally
  }

  return trimmed;
}

/**
 * Ensure the Authorization header value is correctly prefixed with "Bearer ".
 * Handles tokens that already include the prefix (case-insensitive).
 */
function toAuthHeader(token: string): string {
  const trimmed = token.trim();
  return /^bearer\s+/i.test(trimmed) ? trimmed : `Bearer ${trimmed}`;
}

/**
 * Read the auth token from the server-side cookie store.
 * Returns undefined if no session exists.
 */
async function getAuthToken(): Promise<string | undefined> {
  const jar = await cookies();
  // Prefer user session, fall back to expert session.
  return jar.get(COOKIE_NAME)?.value ?? jar.get(EXPERT_COOKIE_NAME)?.value;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch any backend endpoint with automatic auth injection and dev-mode support.
 *
 * In dev mode (NEXT_PUBLIC_DEV_MODE=true), the request is intercepted and
 * served from the mock data in devMode.ts — no real backend needed.
 *
 * In production, the request is forwarded to NEXT_PUBLIC_API_URL with
 * the auth token injected as an Authorization header.
 *
 * @param path  Backend path starting with '/', e.g. '/users/me'
 * @param init  Optional fetch RequestInit (method, headers, body, etc.)
 */
export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  // ── Dev mode: return mock data, skip network ──────────────────────────────
  if (isDev()) {
    const method = init?.method ?? 'GET';

    // Parse body for mock matching (only JSON string payloads)
    let body: unknown;
    if (typeof init?.body === 'string') {
      try { body = JSON.parse(init.body); } catch { /* leave undefined */ }
    }

    const mock = getMockResponse(path, method, body);

    if (mock) {
      console.log(`[DEV] ${method} ${path}`, mock.data ?? mock.error);
      if (mock.error) {
        return new Response(JSON.stringify({ message: mock.error }), {
          status: mock.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(mock.data), {
        status: mock.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // No mock defined → return 404 so callers get a meaningful error
    return new Response(
      JSON.stringify({ message: `[DEV] No mock for ${method} ${path}` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ── Production: proxy to real backend ────────────────────────────────────
  const baseUrl = requireApiUrl();
  const token = await getAuthToken();

  const headers = new Headers(init?.headers);

  // Set Content-Type for JSON string bodies if caller didn't set it
  if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Inject auth token
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', toAuthHeader(token));
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

/**
 * Convenience wrapper for API route handlers that simply proxy a backend call.
 * Automatically handles JSON and plain-text backend responses.
 * Use this in app/api/**.ts route files.
 *
 * @param path  Backend path, e.g. '/experts'
 * @param init  Optional fetch options (method, body, etc.)
 *
 * @example
 * // app/api/experts/route.ts
 * export async function GET() {
 *   return proxyBackendJson('/experts');
 * }
 */
export async function proxyBackendJson(
  path: string,
  init?: RequestInit
): Promise<NextResponse> {
  try {
    const res = await backendFetch(path, init);

    const contentType = res.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => null);
      return NextResponse.json(data ?? { message: 'Invalid JSON from backend' }, {
        status: res.status,
      });
    }

    // Non-JSON response — wrap the text in a message field
    const text = await res.text().catch(() => '');
    return NextResponse.json(
      { message: text || (res.ok ? 'OK' : 'Request failed') },
      { status: res.status }
    );
  } catch (error) {
    // Network-level error (connection refused, DNS, etc.)
    const message = error instanceof Error ? error.message : 'Proxy failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
