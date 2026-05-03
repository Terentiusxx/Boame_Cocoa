import { isDev } from '@/lib/devMode'

export async function GET(
  _req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  if (isDev()) {
    // Local UI-only mode: serve a placeholder image from /public/img
    return Response.redirect(new URL('/img/scan-leaf.png', _req.url), 302)
  }

  const { path } = await context.params
  const rest = Array.isArray(path) ? path.join('/') : ''

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    return new Response(null, { status: 500 })
  }

  const origin = new URL(apiUrl).origin
  const upstream = await fetch(`${origin}/uploads/scans/${rest}`, { method: 'GET' })

  const headers = new Headers()
  const passthrough = [
    'content-type',
    'content-length',
    'cache-control',
    'etag',
    'last-modified',
  ]

  for (const key of passthrough) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }

  const body = await upstream.arrayBuffer().catch(() => null)

  return new Response(body, {
    status: upstream.status,
    headers,
  })
}
