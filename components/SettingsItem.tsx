'use client';

import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import { IconName, ICON_MAP } from '@/lib/icons';
import IconComponent from './IconComponent';

interface SettingsItemProps {
  id: string;
  title: string;
  icon?: IconName;
  hasArrow?: boolean;
  onClick?: () => void;
}

export default function SettingsItem({ 
  id, 
  title, 
  icon, 
  hasArrow = true, 
  onClick 
}: SettingsItemProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior
      router.push(`/settings/${id}`);
    }
  };

  return (
    <div 
      className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 last:border-b-0"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <IconComponent icon={icon} size={20} />
        )}
        <span className="text-brand-input-text font-medium">{title}</span>
      </div>
      {hasArrow && (
        <FiArrowRight size={20} className="text-brand-sub-text" />
      )}
    </div>
  );
}
