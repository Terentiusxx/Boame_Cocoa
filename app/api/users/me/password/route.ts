/**
 * app/api/users/me/password/route.ts
 * PUT /api/users/me/password → backend PUT /users/me/password
 */

import { proxyBackendJson } from '@/lib/backendProxy';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Directly proxy to backend endpoint
    return proxyBackendJson('/users/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Password update failed' },
      { status: 500 }
    );
  }
}