
export const ICON_MAP = {
  // Navigation icons
  home: 'home',
  messages: 'messages',
  learn: 'book',
  settings: 'settings',
  camera: 'scan',

  // Settings icons
  notifications: 'bell',
  profile: 'user',
  language: 'globe',
  privacy: 'lock',
  terms: 'document',
  shield: 'shield',
  help: 'help-circle',
  
  // UI icons
  back: 'arrow-left',
  forward: 'arrow-right',
  close: 'x',
  menu: 'menu',
} as const

export type IconName = typeof ICON_MAP[keyof typeof ICON_MAP]