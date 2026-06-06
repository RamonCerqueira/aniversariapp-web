import React from 'react';

export default function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-start overflow-visible group cursor-pointer w-[200px] h-[60px] ml-1">
      <svg viewBox="0 0 350 80" className="w-[200px] h-full overflow-visible">
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A6327" />
            <stop offset="30%" stopColor="#C5A059" />
            <stop offset="50%" stopColor="#9E7831" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6327" />
          </linearGradient>

          <linearGradient id="gold-glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFDF73" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>

          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Base text - Solid elegant gold */}
        <g fill="url(#gold-gradient)" filter="url(#drop-shadow)">
          <text 
            x="5" y="65" 
            fontFamily="'Great Vibes', cursive" 
            fontSize="85" 
          >
            C
          </text>
          <text 
            x="65" y="55" 
            fontFamily="'Playfair Display', serif" 
            fontSize="45" 
            letterSpacing="3"
          >
            ELEBRATE!
          </text>
        </g>

        {/* Animated Glow Stroke */}
        <g 
          fill="none" 
          stroke="url(#gold-glow-gradient)" 
          strokeWidth="2.5" 
          filter="url(#gold-glow)"
          className="logo-laser-stroke opacity-60 mix-blend-screen"
        >
          <text x="5" y="65" fontFamily="'Great Vibes', cursive" fontSize="85">C</text>
          <text x="65" y="55" fontFamily="'Playfair Display', serif" fontSize="45" letterSpacing="3">ELEBRATE!</text>
        </g>
      </svg>
      <style dangerouslySetInnerHTML={{__html: `
        .logo-laser-stroke text {
          stroke-dasharray: 150 400;
          stroke-dashoffset: 550;
          animation: drawLaser 4s ease-in-out infinite;
        }
        @keyframes drawLaser {
          0% { stroke-dashoffset: 550; opacity: 0; }
          10% { opacity: 0.8; }
          40% { stroke-dashoffset: -100; opacity: 1; }
          50% { stroke-dashoffset: -150; opacity: 0; }
          100% { stroke-dashoffset: -150; opacity: 0; }
        }
      `}} />
    </div>
  );
}
