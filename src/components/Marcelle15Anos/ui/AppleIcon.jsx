import React from "react";

export default function AppleIcon({ className = "", size = 28 }) {
  const id = React.useId();
  const rubyGradientId = `apple-ruby-${id}`;
  const leafGradientId = `apple-leaf-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_0_12px_rgba(220,38,38,0.7)] ${className}`}
    >
      <defs>
        <radialGradient id={rubyGradientId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="50%" stopColor="#C8102E" />
          <stop offset="90%" stopColor="#660000" />
        </radialGradient>
        <linearGradient id={leafGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
      </defs>

      {/* Stem */}
      <path
        d="M32 18C34 12 38 8 42 6"
        stroke="#594100"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Leaf */}
      <path
        d="M34 14C40 10 48 12 46 18C40 22 34 18 34 14Z"
        fill={`url(#${leafGradientId})`}
        stroke="#113F15"
        strokeWidth="1"
      />

      {/* Apple Body */}
      <path
        d="M32 22C24 16 10 20 10 34C10 48 24 58 32 58C40 58 54 48 54 34C54 20 40 16 32 22Z"
        fill={`url(#${rubyGradientId})`}
        stroke="#590000"
        strokeWidth="1.5"
      />

      {/* Glass Highlight Accent */}
      <path
        d="M16 28C14 34 16 42 20 46"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
