'use client';

import Image from "next/image";

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
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior to learn more about the disease
      window.location.href = `/learn/${id}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 mb-3 flex items-center justify-center">
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
          className={`px-4 py-2 rounded-full text-xs font-medium text-white ${color}`}
          style={{ backgroundColor: color === 'red' ? '#ec221f' : color === 'orange' ? '#bf6a02' : '#1f4e20' }}
        >
          Learn more
        </button>
      </div>
    </div>
  );
}
