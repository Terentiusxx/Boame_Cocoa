'use client';

import Image from "next/image";

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
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior
      if (id === 'unknown') {
        window.location.href = '/results/unknown';
      } else {
        window.location.href = `/results/${id}`;
      }
    }
  };

  return (
    <div className="disease-card" onClick={handleClick}>
      <div className="disease-info">
        <div className="disease-icon">
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
          <p className={urgencyClass}>{urgency}</p>
        </div>
      </div>
      <span className="text-gray-400 text-xl">❯</span>
    </div>
  );
}