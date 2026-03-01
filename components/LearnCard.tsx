'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';

interface LearnCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  onClick?: () => void;
}

export default function LearnCard({ 
  id, 
  name, 
  description, 
  image, 
  color, 
  onClick 
}: LearnCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior to learn more about the disease
      router.push(`/learn/${id}`);
    }
  };

  const buttonColorMap: Record<string, string> = {
    'red': 'bg-urgency-high',
    'orange': 'bg-urgency-medium',
    'green': 'bg-brand-buttons',
  };

  return (
    <div 
      className="bg-white rounded-brand p-4 shadow-card border border-gray-100 cursor-pointer transition-all text-center hover:shadow-card-hover hover:-translate-y-0.5"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={`${name} icon`}
              width={64}
              height={64}
              className="object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center text-2xl">🍃</div>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">{name}</h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{description}</p>
        <button 
          className={`inline-block px-4 py-2 rounded-full text-xs font-medium text-center text-white no-underline transition-opacity hover:opacity-90 ${buttonColorMap[color] || 'bg-brand-buttons'}`}
        >
          Learn more
        </button>
      </div>
    </div>
  );
}
