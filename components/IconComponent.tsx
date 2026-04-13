/**
 * IconComponent.tsx
 * ─────────────────────────────────────────────────────────────
 * Renders a named icon from the centralised ICON_MAP.
 *
 * Usage: <IconComponent icon="home" size={24} className="text-green-600" />
 *
 * To add a new icon:
 * 1. Import it from react-icons here.
 * 2. Add it to `iconComponents` below.
 * 3. Add the key to ICON_MAP in lib/icons.ts.
 */
import type { ComponentType } from 'react';
import {
  FiHelpCircle,
  FiBell,
  FiUser,
  FiGlobe,
  FiLock,
  FiFileText,
  FiShield,
  FiAlertTriangle,
  FiArrowLeft,
  FiX,
  FiMenu,
  FiSettings,
} from 'react-icons/fi';
import { LuMessageSquareText, LuBookOpenText, LuLeaf } from 'react-icons/lu';
import { RiHome3Line } from 'react-icons/ri';
import { TbObjectScan } from 'react-icons/tb';
import { MdOutlineNavigateNext } from 'react-icons/md';

import type { IconName } from '@/lib/icons';

interface IconComponentProps {
  icon: IconName | string; // string fallback allows icon_name from backend data
  size?: number;
  className?: string;
}

// Map of every valid icon name to its React component
const iconComponents: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  // Navigation
  home:         RiHome3Line,
  messages:     LuMessageSquareText,
  book:         LuBookOpenText,
  settings:     FiSettings,
  scan:         TbObjectScan,

  // Settings / profile
  bell:         FiBell,
  user:         FiUser,
  globe:        FiGlobe,
  lock:         FiLock,
  document:     FiFileText,
  shield:       FiShield,
  'help-circle': FiHelpCircle,

  // Disease / results
  leaf:          LuLeaf,
  'shield-alert': FiAlertTriangle,

  // General UI
  'arrow-left':  FiArrowLeft,
  'arrow-right': MdOutlineNavigateNext,
  x:             FiX,
  menu:          FiMenu,
};

export default function IconComponent({
  icon,
  size = 24,
  className = '',
}: IconComponentProps) {
  const Component = iconComponents[icon];

  // Fallback to help-circle if icon name isn't registered
  // (silently — no console.warn in production)
  if (!Component) {
    return <FiHelpCircle size={size} className={className} />;
  }

  return <Component size={size} className={className} />;
}
