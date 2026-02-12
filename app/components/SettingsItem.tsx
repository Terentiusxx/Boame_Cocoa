'use client';

interface SettingsItemProps {
  id: string;
  title: string;
  icon?: string;
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
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior
      window.location.href = `/settings/${id}`;
    }
  };

  return (
    <div 
      className="flex items-center justify-between py-4 px-4 bg-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="text-lg">{icon}</span>
        )}
        <span className="text-gray-900 font-medium">{title}</span>
      </div>
      {hasArrow && (
        <span className="text-gray-400 text-lg">❯</span>
      )}
    </div>
  );
}
