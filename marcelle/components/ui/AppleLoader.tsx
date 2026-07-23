"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppleLoaderProps {
  onComplete?: () => void;
}

export default function AppleLoader({ onComplete }: AppleLoaderProps) {
  const [bitten, setBitten] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Stage 1: Appear (0s)
    
    // Stage 2: Bite (1.5s)
    const biteTimer = setTimeout(() => {
      setBitten(true);
    }, 1500);

    // Stage 3: Fade out (2.5s)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2500);

    return () => {
      clearTimeout(biteTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!fading && (
        <motion.div
          exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-royal-dark overflow-hidden"
        >
          {/* Background Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/royal.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]"
            >
              <defs>
                <linearGradient id="appleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>
                <mask id="appleMask">
                  <rect width="100%" height="100%" fill="white" />
                  <motion.circle
                    initial={{ r: 0 }}
                    animate={{ r: bitten ? 40 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    cx="150"
                    cy="80"
                    fill="black"
                  />
                  <motion.circle
                    initial={{ r: 0 }}
                    animate={{ r: bitten ? 25 : 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
                    cx="140"
                    cy="110"
                    fill="black"
                  />
                </mask>
              </defs>

              {/* Glow Behind */}
              <motion.circle
                cx="100"
                cy="100"
                r="60"
                fill="url(#appleGradient)"
                filter="blur(40px)"
                opacity="0.4"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Apple Body */}
              <motion.path
                d="M60 60 C 20 60, 20 160, 100 180 C 180 160, 180 60, 140 60 C 120 60, 110 80, 100 80 C 90 80, 80 60, 60 60 Z"
                fill="url(#appleGradient)"
                mask="url(#appleMask)"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              {/* Leaf with Gold Stroke */}
              <motion.path
                d="M100 60 Q120 30 140 60 Q120 90 100 60Z"
                fill="#4ade80"
                stroke="#D4AF37"
                strokeWidth="1"
                initial={{ opacity: 0, rotate: -45, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ transformOrigin: "100px 60px" }}
              />
              
              {/* Shine/Reflection */}
              <motion.path
                d="M70 70 Q 50 70, 50 120"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </svg>
            
            {/* Text Loading */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }}
               className="absolute -bottom-12 text-gold font-cinzel text-sm tracking-[0.3em] uppercase"
            >
               Carregando
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
