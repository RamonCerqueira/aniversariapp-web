"use client";

import React from "react";

export default function BaroqueFrame({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-[-4%] w-[108%] h-[108%] pointer-events-none z-10 ${className}`}>
      <svg
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="baroqueGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A1" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#997A15" />
            <stop offset="100%" stopColor="#FDF0A6" />
          </linearGradient>
        </defs>

        {/* Outer Filigree Oval */}
        <ellipse
          cx="200"
          cy="250"
          rx="185"
          ry="235"
          stroke="url(#baroqueGold)"
          strokeWidth="4"
          strokeDasharray="6 4"
        />

        {/* Inner Ornate Filigree Oval */}
        <ellipse
          cx="200"
          cy="250"
          rx="175"
          ry="225"
          stroke="url(#baroqueGold)"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Top Flourish */}
        <path
          d="M160 25 C180 10 220 10 240 25 C220 35 180 35 160 25 Z"
          fill="url(#baroqueGold)"
          opacity="0.9"
        />

        {/* Bottom Flourish */}
        <path
          d="M160 475 C180 490 220 490 240 475 C220 465 180 465 160 475 Z"
          fill="url(#baroqueGold)"
          opacity="0.9"
        />

        {/* Side Ornaments Left */}
        <path
          d="M15 230 C5 240 5 260 15 270 C25 260 25 240 15 230 Z"
          fill="url(#baroqueGold)"
          opacity="0.8"
        />

        {/* Side Ornaments Right */}
        <path
          d="M385 230 C395 240 395 260 385 270 C375 260 375 240 385 230 Z"
          fill="url(#baroqueGold)"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
