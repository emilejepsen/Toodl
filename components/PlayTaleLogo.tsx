import React from 'react';

interface PlayTaleLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PlayTaleLogo({ size = 'md', className = '' }: PlayTaleLogoProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* PlayTale Logo - Simple Recreation */}
      <div className={`${sizeClasses[size]} mb-3 flex items-center justify-center`}>
        <svg viewBox="0 0 120 80" className="w-full h-full">
          {/* Regnbue */}
          <path d="M20 60 Q 60 20 100 60" stroke="#FF1493" strokeWidth="6" fill="none"/>
          <path d="M25 60 Q 60 25 95 60" stroke="#FFD700" strokeWidth="6" fill="none"/>
          <path d="M30 60 Q 60 30 90 60" stroke="#00FFFF" strokeWidth="6" fill="none"/>
          <path d="M35 60 Q 60 35 85 60" stroke="#32CD32" strokeWidth="6" fill="none"/>
          <path d="M40 60 Q 60 40 80 60" stroke="#1E90FF" strokeWidth="6" fill="none"/>
          <path d="M45 60 Q 60 45 75 60" stroke="#9932CC" strokeWidth="6" fill="none"/>
          
          {/* Åben bog */}
          <path d="M40 50 L60 55 L80 50 L80 75 L60 70 L40 75 Z" fill="#6B46C1"/>
          <path d="M40 50 L60 55 L60 70 L40 75 Z" fill="#7C3AED"/>
          <path d="M60 55 L80 50 L80 75 L60 70 Z" fill="#5B21B6"/>
          
          {/* Bog sider */}
          <rect x="43" y="55" width="15" height="15" fill="white" rx="1"/>
          <rect x="62" y="55" width="15" height="15" fill="white" rx="1"/>
          
          {/* Orange fugl */}
          <ellipse cx="30" cy="35" rx="6" ry="4" fill="#FF8C00"/>
          <ellipse cx="34" cy="33" rx="4" ry="3" fill="#FFA500"/>
          <circle cx="32" cy="33" r="1" fill="#000"/>
          
          {/* Blå tryllestav */}
          <polygon points="85,25 90,30 85,35 80,30" fill="#1E3A8A"/>
          <rect x="82" y="35" width="6" height="2" fill="#1E3A8A"/>
          
          {/* Stjerner */}
          <polygon points="95,30 96,33 99,33 97,35 98,38 95,36 92,38 93,35 91,33 94,33" fill="#FFD700"/>
          <circle cx="100" cy="25" r="1.5" fill="#FFD700"/>
          <polygon points="25,20 26,23 29,23 27,25 28,28 25,26 22,28 23,25 21,23 24,23" fill="#FFD700"/>
          <circle cx="95" cy="40" r="1" fill="#FFD700"/>
        </svg>
      </div>

      {/* PlayTale tekst */}
      <h1 className={`font-bold text-playtale-primary ${textSizeClasses[size]} tracking-tight`}>
        PlayTale
      </h1>
    </div>
  );
}
