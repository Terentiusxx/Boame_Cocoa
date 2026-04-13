/**
 * utils.ts
 * ─────────────────────────────────────────────────────────────
 * Reusable helper functions shared across the entire app.
 * Import what you need — tree-shaking keeps the bundle lean.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Tailwind ─────────────────────────────────────────────────────────────────

/**
 * Merge Tailwind class names with conflict resolution.
 * Use this in components instead of manually concatenating strings.
 * Example: cn('px-4 py-2', isActive && 'bg-green-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── API / Data Helpers ───────────────────────────────────────────────────────

/**
 * Many backend responses wrap data inside a `{ data: T }` envelope.
 * This helper unwraps it transparently so callers don't need to check.
 *
 * Example: unwrapData({ data: [1,2,3] }) → [1,2,3]
 *          unwrapData([1,2,3])           → [1,2,3]
 */
export function unwrapData<T>(value: T | { data?: T } | null): T | null {
  if (!value) return null;
  if (typeof value === 'object' && 'data' in value) {
    return ((value as { data?: T }).data ?? null) as T | null;
  }
  return value as T;
}

/**
 * Extract a human-readable error message from any thrown value or API payload.
 * Handles: Error objects, strings, { message, detail }, arrays, and raw objects.
 *
 * Example: extractErrorMessage(err) in a catch block
 */
export function extractErrorMessage(value: unknown, fallback = 'Something went wrong'): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value || fallback;
  if (value instanceof Error) return value.message || fallback;

  if (Array.isArray(value)) {
    const messages = value.map((v) => extractErrorMessage(v, '')).filter(Boolean);
    return messages.join(', ') || fallback;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message) return obj.message;
    if (typeof obj.detail === 'string' && obj.detail) return obj.detail;
    // FastAPI validation errors: { detail: [{ msg, loc }] }
    if (Array.isArray(obj.detail)) return extractErrorMessage(obj.detail, fallback);
    try { return JSON.stringify(value); } catch { return fallback; }
  }

  return String(value) || fallback;
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

/**
 * Format a date into a human-readable string.
 * Example: "April 10, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a date with time.
 * Example: "Apr 10, 2026, 02:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format a time-only string.
 * Example: "02:30 PM"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Disease / Urgency Helpers ────────────────────────────────────────────────

/**
 * Convert a raw urgency_level string from the backend to UI-ready values.
 * Returns the display label and CSS class name for the urgency colour.
 *
 * Example: urgencyToUi('high') → { label: 'High Urgency', className: 'text-urgency-high' }
 */
export function urgencyToUi(level?: string): { label: string; className: string } {
  const v = level?.toLowerCase();
  if (v === 'high')   return { label: 'High Urgency',   className: 'text-urgency-high' };
  if (v === 'medium') return { label: 'Medium Urgency', className: 'text-urgency-medium' };
  if (v === 'low')    return { label: 'Low Urgency',    className: 'text-urgency-low' };
  return { label: 'Unknown', className: 'text-gray-500' };
}

/**
 * Map a disease name (from history / home payloads) to a local image in /public/img.
 * This decouples the UI from backend-served image URLs.
 *
 * Add new entries here whenever a new disease is added to the backend.
 */
export function getDiseaseLocalImage(diseaseName?: string | null): string {
  const v = (diseaseName ?? '').trim().toLowerCase();

  if (!v || v.includes('unknown') || v.includes("wasn't able") || v.includes('unable')) {
    return '/img/unknown.png';
  }
  if (v.includes('cssvd') || v.includes('swollen shoot') || v.includes('swollen')) {
    return '/img/ccsvd.png';
  }
  if (v.includes('black pod') || v.includes('blackpod')) {
    return '/img/blackpod.png';
  }
  if (v.includes('vascular') || (v.includes('streak') && v.includes('dieback'))) {
    return '/img/vascularstreak.png';
  }

  return '/img/unknown.png';
}

// ─── Text Helpers ──────────────────────────────────────────────────────────────

/**
 * Truncate a string to `length` chars, appending "..." if cut.
 */
export function truncate(text: string, length: number): string {
  return text.length <= length ? text : text.slice(0, length) + '...';
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Build initials from a first and last name.
 * Example: initials('Ama', 'Mensah') → 'AM'
 */
export function initials(first: string, last: string): string {
  return `${(first || 'E')[0] ?? 'E'}${(last || 'X')[0] ?? 'X'}`.toUpperCase();
}

// ─── Misc ──────────────────────────────────────────────────────────────────────

/**
 * Debounce a function — delays execution until `delay` ms after the last call.
 * Useful for search inputs, resize handlers, etc.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Promise-based sleep / delay.
 * Example: await sleep(500) — waits 500 ms
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format bytes into a human-readable file size string.
 * Example: formatFileSize(1048576) → "1 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}
