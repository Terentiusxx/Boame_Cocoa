import type { ComponentType } from 'react'
import {
  FiHelpCircle,
  FiBell,
  FiUser,
  FiGlobe,
  FiLock,
  FiFileText,
  FiShield,
  FiArrowLeft,
  FiX,
  FiMenu,
  FiSettings
} from 'react-icons/fi'
import { LuMessageSquareText, LuBookOpenText } from 'react-icons/lu'
import { RiHome3Line } from 'react-icons/ri'
import { TbObjectScan } from 'react-icons/tb'
import { MdOutlineNavigateNext } from 'react-icons/md'

import { IconName } from '@/lib/icons';

interface IconComponentProps {
  icon: IconName;
  size?: number;
  className?: string;
}

const iconComponents: Record<IconName, ComponentType<{ size?: number; className?: string }>> = {
  'help-circle': FiHelpCircle,
  'bell': FiBell,
  'user': FiUser,
  'globe': FiGlobe,
  'lock': FiLock,
  'document': FiFileText,
  'shield': FiShield,
  'arrow-left': FiArrowLeft,
  'arrow-right': MdOutlineNavigateNext,
  'x': FiX,
  'menu': FiMenu,
  'messages': LuMessageSquareText,
  'settings': FiSettings,
  'home': RiHome3Line,
  'book': LuBookOpenText,
  'scan': TbObjectScan
}

export default function IconComponent({ 
  icon, 
  size = 24, 
  className = '' 
}: IconComponentProps) {
  const Component = iconComponents[icon];
  
  if (!Component) {
    console.warn(`Icon "${icon}" not found in icon map`);
    return <FiHelpCircle size={size} className={className} />
  }
  
  return <Component size={size} className={className} />
}
