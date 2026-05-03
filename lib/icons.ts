/**
 * icons.ts
 * ─────────────────────────────────────────────────────────────
 * Maps semantic icon names to string keys used by IconComponent.
 * Add new icons here — then register them in IconComponent.tsx.
 *
 * Design rule: always use ICON_MAP constants, never raw strings,
 * so renaming an icon is a one-line change.
 */

export const ICON_MAP = {
  // ── Navigation ────────────────────────────────────────────
  home:     'home',
  messages: 'messages',
  learn:    'book',
  settings: 'settings',
  camera:   'scan',

  // ── Settings / Profile ────────────────────────────────────
  bell:     'bell',
  user:     'user',
  globe:    'globe',
  lock:     'lock',
  document: 'document',
  shield:   'shield',
  help:     'help-circle',

  // ── Disease / Results ─────────────────────────────────────
  leaf:         'leaf',
  shieldAlert:  'shield-alert',

  // ── General UI ────────────────────────────────────────────
  back:     'arrow-left',
  forward:  'arrow-right',
  close:    'x',
  menu:     'menu',
} as const;

/** Union of all valid icon name strings — used to type the `icon` prop */
export type IconName = typeof ICON_MAP[keyof typeof ICON_MAP];