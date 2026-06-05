import React from 'react';

// The beautiful celebratory Balloon-Candle custom SVG icon
export const CelebrateIcon = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" /> {/* Hot Pink */}
          <stop offset="100%" stopColor="#6366F1" /> {/* Deep Indigo */}
        </linearGradient>
        <linearGradient id="flameGlow" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EAB308" /> {/* Gold Amber */}
          <stop offset="100%" stopColor="#F97316" /> {/* Radiant Orange */}
        </linearGradient>
      </defs>
      
      {/* 3D-effect Balloon/Candle Base */}
      <path 
        d="M16 6C10.48 6 6 10.48 6 16C6 20.35 8.78 24.04 12.67 25.37L12 28.5C12 29.33 12.67 30 13.5 30H18.5C19.33 30 20 29.33 20 28.5L19.33 25.37C23.22 24.04 26 20.35 26 16C26 10.48 21.52 6 16 6Z" 
        fill="url(#logoGlow)" 
      />
      
      {/* The Floating Candle Flame representing birthday & celebration */}
      <path 
        d="M16 0.5C16 0.5 13.5 3 13.5 5C13.5 6.38 14.62 7.5 16 7.5C17.38 7.5 18.5 6.38 18.5 5C18.5 3 16 0.5 16 0.5Z" 
        fill="url(#flameGlow)" 
      />
      
      {/* Gloss Highlight for premium glassmorphic texture */}
      <path 
        d="M11 11C10.45 11 10 11.45 10 12C10 13.66 11.34 15 13 15C13.55 15 14 14.55 14 14C14 13.45 13.55 13 13 13C11.9 13 11 12.1 11 11Z" 
        fill="white" 
        fillOpacity="0.45" 
      />
      
      {/* Dynamic Star Sparkle inside */}
      <path 
        d="M19 13.5C20 13.5 20.5 13 20.5 12C20.5 13 21 13.5 22 13.5C21 13.5 20.5 14 20.5 15C20.5 14 20 13.5 19 13.5Z" 
        fill="white" 
        fillOpacity="0.6" 
      />
    </svg>
  );
};

// Full horizontal logo with premium typography
export const CelebrateLogo = ({ className = "flex items-center gap-3" }) => {
  return (
    <div className={className}>
      <CelebrateIcon className="w-10 h-10 shrink-0" />
      <div className="flex flex-col">
        <span className="font-black text-xl tracking-tight leading-none bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          CELEBRATE
        </span>
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
          Premium Party Planning
        </span>
      </div>
    </div>
  );
};
