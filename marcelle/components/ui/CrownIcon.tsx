"use client";

import React from "react";

interface CrownIconProps {
  className?: string;
  size?: number;
}

export default function CrownIcon({ className = "", size = 32 }: CrownIconProps) {
  const id = React.useId();
  const goldGradientId = `crown-gold-${id}`;
  const rubyGradientId = `crown-ruby-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_0_12px_rgba(212,175,55,0.6)] ${className}`}
    >
      <defs>
        {/* Metallic Gold Gradient */}
        <linearGradient id={goldGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A1" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#FDF0A6" />
        </linearGradient>
        {/* Ruby Jewel Gradient */}
        <radialGradient id={rubyGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="70%" stopColor="#990000" />
          <stop offset="100%" stopColor="#4A0000" />
        </radialGradient>
      </defs>

      {/* Crown Base */}
      <path
        d="M10 44C10 42.8954 10.8954 42 12 42H52C53.1046 42 54 42.8954 54 44V48C54 49.1046 53.1046 50 52 50H12C10.8954 50 10 49.1046 10 48V44Z"
        fill={`url(#${goldGradientId})`}
        stroke="#594100"
        strokeWidth="1.5"
      />

      {/* Crown Peaks */}
      <path
        d="M10 42L14 22L24 32L32 14L40 32L50 22L54 42H10Z"
        fill={`url(#${goldGradientId})`}
        stroke="#594100"
        strokeWidth="1.5"
      />

      {/* Jewels on Peaks */}
      <circle cx="14" cy="20" r="3" fill={`url(#${rubyGradientId})`} stroke="#FFF2A1" strokeWidth="0.8" />
      <circle cx="32" cy="12" r="4.5" fill={`url(#${rubyGradientId})`} stroke="#FFF2A1" strokeWidth="1" />
      <circle cx="50" cy="20" r="3" fill={`url(#${rubyGradientId})`} stroke="#FFF2A1" strokeWidth="0.8" />

      {/* Jewels on Base */}
      <circle cx="20" cy="46" r="2.5" fill={`url(#${rubyGradientId})`} />
      <circle cx="32" cy="46" r="2.5" fill="#FFF2A1" />
      <circle cx="44" cy="46" r="2.5" fill={`url(#${rubyGradientId})`} />
    </svg>
  );
}
