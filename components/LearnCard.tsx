'use client';

import { useRouter } from 'next/navigation';
import IconComponent from './IconComponent';

interface LearnCardProps {
  diseaseId: string | number;
  name: string;
  description: string;
  imageUrl?: string;
  urgencyLevel?: string;
  onClick?: () => void;
}

export default function LearnCard({ 
  diseaseId, 
  name, 
  description, 
  imageUrl, 
  urgencyLevel, 
  onClick 
}: LearnCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior to learn more about the disease
      router.push(`/learn/${diseaseId}`);
    }
  };

  const urgency = (urgencyLevel || '').toLowerCase();
  const buttonClass =
    urgency === 'high'
      ? 'bg-urgency-high'
      : urgency === 'medium'
        ? 'bg-urgency-medium'
        : 'bg-brand-buttons';

  return (
    <div 
      className="bg-white rounded-brand p-4 shadow-card border border-gray-100 cursor-pointer transition-all text-center hover:shadow-card-hover hover:-translate-y-0.5"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          {imageUrl ? (
            // Use <img> so backend URLs work without Next image domain config.
            <img
              src={imageUrl}
              alt={`${name} icon`}
              width={64}
              height={64}
              className="object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <IconComponent icon="leaf" size={32} />
            </div>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">{name}</h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{description}</p>
        <button 
          className={`inline-block px-4 py-2 rounded-full text-xs font-medium text-center text-white no-underline transition-opacity hover:opacity-90 ${buttonClass}`}
        >
          Learn more
        </button>
      </div>
    </div>
  );
}
