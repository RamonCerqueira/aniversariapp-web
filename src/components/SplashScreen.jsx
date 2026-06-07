import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 3,
  delay: Math.random() * 1.5,
  duration: 2.5 + Math.random() * 2,
}));

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('show'); // 'show' | 'fadeout'
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    // Exibe por 2.2s depois inicia fade-out
    const showTimer = setTimeout(() => setPhase('fadeout'), 2200);
    // Notifica o pai após o fade-out completar (~600ms)
    const finishTimer = setTimeout(() => onFinishRef.current?.(), 2900);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {phase === 'show' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0c0a08 0%, #1a1208 40%, #0f0c06 70%, #0c0a08 100%)'
          }}
        >
          {/* Ambient glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/8 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-orange-400/6 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[150px] pointer-events-none" />

          {/* Floating gold particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: 'radial-gradient(circle, #D4AF37 0%, #8A6327 100%)',
                boxShadow: `0 0 ${p.size * 2}px rgba(212,175,55,0.6)`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-8">

            {/* Logo Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Big Celebrate! SVG Logo */}
              <svg viewBox="0 0 420 100" className="w-72 sm:w-96 h-auto overflow-visible mb-1">
                <defs>
                  <linearGradient id="splash-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8A6327" />
                    <stop offset="25%" stopColor="#C5A059" />
                    <stop offset="50%" stopColor="#FFDF73" />
                    <stop offset="75%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#8A6327" />
                  </linearGradient>
                  <linearGradient id="splash-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                    <stop offset="50%" stopColor="#FFDF73" stopOpacity="1" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                  <filter id="splash-shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4AF37" floodOpacity="0.4" />
                  </filter>
                  <filter id="splash-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Base gold text */}
                <g fill="url(#splash-gold)" filter="url(#splash-shadow)">
                  <text x="5" y="82" fontFamily="'Great Vibes', cursive" fontSize="105">C</text>
                  <text x="78" y="70" fontFamily="'Playfair Display', serif" fontSize="56" letterSpacing="4">ELEBRATE!</text>
                </g>

                {/* Animated shimmer stroke */}
                <g fill="none" stroke="url(#splash-glow)" strokeWidth="3" filter="url(#splash-glow-filter)"
                   className="opacity-60 mix-blend-screen splash-laser">
                  <text x="5" y="82" fontFamily="'Great Vibes', cursive" fontSize="105">C</text>
                  <text x="78" y="70" fontFamily="'Playfair Display', serif" fontSize="56" letterSpacing="4">ELEBRATE!</text>
                </g>
              </svg>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="text-amber-200/70 text-xs font-semibold tracking-[0.3em] uppercase text-center"
              >
                A plataforma de festas inesquecíveis
              </motion.p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
              className="w-32 h-[2px] rounded-full overflow-hidden bg-white/10 origin-left"
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #8A6327, #FFDF73, #8A6327)' }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, delay: 1, ease: 'easeInOut', repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Bottom subtle text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute bottom-10 text-amber-200/60 text-[10px] tracking-[0.2em] uppercase font-medium"
          >
            Carregando seu evento...
          </motion.p>

          <style dangerouslySetInnerHTML={{ __html: `
            .splash-laser text {
              stroke-dasharray: 180 500;
              stroke-dashoffset: 680;
              animation: splashLaser 3s ease-in-out infinite;
            }
            @keyframes splashLaser {
              0% { stroke-dashoffset: 680; opacity: 0; }
              15% { opacity: 0.9; }
              55% { stroke-dashoffset: -120; opacity: 1; }
              70% { stroke-dashoffset: -180; opacity: 0; }
              100% { stroke-dashoffset: -180; opacity: 0; }
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
