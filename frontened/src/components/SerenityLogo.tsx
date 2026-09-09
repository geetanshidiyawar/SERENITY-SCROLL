import React from 'react';

interface SerenityLogoProps {
  subtitle?: string;
  onClick?: () => void;
}

export const SerenityLogo: React.FC<SerenityLogoProps> = ({ subtitle, onClick }) => {
  return (
    <div 
      id="serenity-main-branding"
      onClick={onClick}
      className={`text-center py-6 select-none flex flex-col items-center justify-center transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="inline-flex items-center justify-center gap-3 group">
        <span 
          role="img" 
          aria-label="Fresh leaf"
          className="text-3xl sm:text-4xl transform group-hover:rotate-12 transition-transform duration-500 ease-out"
        >
          🌿
        </span>
        <h1 className="text-2xl sm:text-3xl tracking-[0.22em] font-medium text-[#26382C] uppercase font-editorial">
          SERENITY
        </h1>
      </div>
      {subtitle && (
        <p className="mt-2 text-xs sm:text-sm text-[#5C7063] font-light tracking-wider">
          {subtitle}
        </p>
      )}
    </div>
  );
};
