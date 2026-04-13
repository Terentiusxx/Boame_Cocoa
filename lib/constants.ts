/**
 * constants.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all app-wide constant values.
 * Import from here instead of hard-coding strings in multiple files.
 */

// ─── App Info ────────────────────────────────────────────────────────────────

export const APP_NAME = 'Boame Cocoa';
export const APP_DESCRIPTION = 'Cocoa Disease Detection Scanner';
export const APP_VERSION = '1.0.0';

// ─── Auth Cookies ────────────────────────────────────────────────────────────
// Used by login route, logout route, session route, and backendProxy.
// Change here once — applies everywhere.

export const COOKIE_NAME = 'auth_token';
export const USER_ID_COOKIE = 'user_id';

/** Expert auth cookies — separate from user session so both can coexist */
export const EXPERT_COOKIE_NAME = 'expert_token';
export const EXPERT_ID_COOKIE   = 'expert_id';

/** Cookie options shared across login/logout routes */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// ─── Routes ──────────────────────────────────────────────────────────────────
// Centralised client-side route paths. Use these in Link href and router.push().

export const ROUTES = {
  SPLASH:         '/splash',
  LOGIN:          '/login',
  CREATE_ACCOUNT: '/create-account',
  FORGOT_PASSWORD:'/forgot-password',
  HOME:           '/home',
  SCAN:           '/scan',
  PROCESSING:     '/processing',
  VOICE_DESCRIBE: '/voice-describe',
  RESULTS:        '/results',
  HISTORY:        '/history',
  CONTACT:        '/contact',
  MESSAGES:       '/messages',
  LEARN:          '/learn',
  SETTINGS:       '/settings',
  EDIT_PROFILE:   '/settings/edit-profile',
} as const;

/** Expert portal routes */
export const EXPERT_ROUTES = {
  LOGIN:         '/expert/login',
  REGISTER:      '/expert/register',
  DASHBOARD:     '/expert/dashboard',
  CONSULTATIONS: '/expert/consultations',
  PROFILE:       '/expert/profile',
} as const;

// ─── Session Storage Keys ────────────────────────────────────────────────────
// All sessionStorage keys used in the scan flow live here.
// ProcessingClient writes these; ResultsPage reads them.

export const SESSION_KEYS = {
  SCAN_IMAGE: 'scan_image',   // blob: or data: URL of the captured image
  SCAN_ID: 'scan_id',         // numeric scan ID returned by the backend after upload
  SCAN_PREDICTION: 'scan_prediction', // JSON-stringified { disease_id, confidence_score, created_at }
} as const;

// ─── Local Storage Keys ──────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// ─── Image Upload ────────────────────────────────────────────────────────────

export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5 MB
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// ─── Disease Display ─────────────────────────────────────────────────────────
// Urgency level strings returned by the backend, mapped to UI labels.

export const URGENCY_LABELS: Record<string, string> = {
  high: 'High Urgency',
  medium: 'Medium Urgency',
  low: 'Low Urgency',
};

// ─── Validation Rules ────────────────────────────────────────────────────────

export const VALIDATION = {
  PASSWORD: { MIN_LENGTH: 6 },
  NAME: { MIN_LENGTH: 2 },
  EMAIL: { PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
} as const;
