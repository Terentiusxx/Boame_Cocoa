'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';

interface DiseaseCardProps {
  id: string;
  name: string;
  urgency: string;
  image: string;
  urgencyClass: string;
  onClick?: () => void;
}

export default function DiseaseCard({ 
  id, 
  name, 
  urgency, 
  image, 
  urgencyClass, 
  onClick 
}: DiseaseCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior
      router.push(`/results/${id}`);
    }
  };

  const urgencyColorMap: Record<string, string> = {
    'urgency-high': 'text-urgency-high',
    'urgency-medium': 'text-urgency-medium',
    'urgency-low': 'text-brand-buttons',
  };

  return (
    <div 
      className="bg-gray-50 rounded-brand p-4 my-3 flex items-center justify-between cursor-pointer transition-transform hover:translate-x-1"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-brand-sm bg-green-50 flex items-center justify-center text-2xl">
          {image ? (
            <Image
              src={image}
              alt={`${name} icon`}
              width={32}
              height={32}
              className="object-contain"
            />
          ) : null}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
          <p className={`${urgencyColorMap[urgencyClass] || 'text-gray-600'} font-semibold text-sm`}>{urgency}</p>
        </div>
      </div>
      <span className="text-gray-400 text-xl">❯</span>
    </div>
  );
}