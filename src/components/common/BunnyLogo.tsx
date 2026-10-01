import React from 'react';

interface BunnyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
}

export const BunnyLogo: React.FC<BunnyLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  animate = false,
  onClick,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-11 h-11 text-xl',
    xl: 'w-16 h-16 text-2xl',
  };

  const imgSizeMap = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight select-none ${
        onClick ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''
      } ${className}`}
    >
      <div className={`relative flex-shrink-0 ${imgSizeMap[size]} ${animate ? 'hover:animate-bounce animate-pulse' : ''}`}>
        <img
          src="/assets/bunny-icon.png"
          alt="Bunny Talks 🐰"
          className="w-full h-full object-contain rounded-xl drop-shadow-[0_4px_12px_rgba(255,96,125,0.35)]"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
            if ((e.target as HTMLElement).nextElementSibling) {
              ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
        <div
          style={{ display: 'none' }}
          className="w-full h-full rounded-xl bg-gradient-to-tr from-bunny-coral to-bunny-secondary text-white items-center justify-center font-bold text-lg"
        >
          🐰
        </div>
      </div>
      {showText && (
        <span className={`font-extrabold text-bunny-ink tracking-tight ${sizeMap[size]}`}>
          Bunny <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff607d] to-[#7b5cf5]">Talks</span>
        </span>
      )}
    </div>
  );
};
