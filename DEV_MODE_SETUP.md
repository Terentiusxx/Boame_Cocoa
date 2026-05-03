# Dev Mode Setup Guide

## Overview
The dev mode allows you to work on UI design without a backend connection. All API calls return hardcoded mock data.

## Setup

1. **Create `.env.local` file** in the project root (copy from `.env.local.example`):
   ```
   NEXT_PUBLIC_DEV_MODE=true
   ```

2. **Restart your dev server** (required for environment variables to take effect):
   ```
   npm run dev
   ```

## How It Works

- When `NEXT_PUBLIC_DEV_MODE=true`, all API calls are intercepted
- Mock data is returned instead of actual backend requests
- Console logs show `[DEV MODE]` prefixed messages for debugging
- Works for both server-side API calls (`serverApi`) and client-side calls (`backendFetch`)

## Mock Data Available

See [lib/devMode.ts](./lib/devMode.ts) for the hardcoded data:

- **Users**: Dev user with sample profile
- **Diseases**: 4 sample diseases (Black Pod, Frosty Pod Rot, Pod Borer, Healthy)
- **Scans**: 2 sample scans with different diseases
- **Consultations**: Sample consultation records
- **Auth**: Mock login/logout

## Endpoints Covered

- `GET /diseases` - List all diseases
- `GET /diseases/:id` - Get single disease
- `GET /scans` - List user scans
- `GET /scans/:id` - Get single scan
- `POST /scans` - Create new scan
- `GET /users/me` - Get current user
- `GET /users/dashboard` - Get dashboard data
- `POST /auth/login` - Mock authentication
- `GET /consultations` - List consultations
- `POST /ai/predict` - Mock AI prediction

... and more. See `getMockResponse()` function in [lib/devMode.ts](./lib/devMode.ts)

## Adding More Mock Data

Edit [lib/devMode.ts](./lib/devMode.ts):

1. Add mock data object (e.g., `mockNewFeature`)
2. Add handling in `getMockResponse()` function:
   ```typescript
   if (path === '/new-endpoint' && method === 'GET') {
     return { status: 200, data: mockNewFeature };
   }
   ```

## Disabling Dev Mode

Simply remove or set `NEXT_PUBLIC_DEV_MODE=false` in `.env.local`, then restart the dev server.

## Console Output

Dev mode logs all API calls with `[DEV MODE]` prefix:
```
[DEV MODE] GET /users/me { user_id: 1, name: 'John Dev Mode', ... }
[DEV MODE] POST /scans { scan_id: 1, ... }
```

This helps you debug and understand what data your components are receiving.
