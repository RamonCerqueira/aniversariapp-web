import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MagicCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const particleId = useRef(0);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    const handleMouseMove = (e) => {
      if (isMobile) return;
      setMousePos({ x: e.clientX, y: e.clientY });

      // Create a new particle from the "tip" of the wand
      const newParticle = {
        id: particleId.current++,
        x: e.clientX - 5, 
        y: e.clientY - 5,
        size: Math.random() * 6 + 2,
        color: Math.random() > 0.5 ? "#D4AF37" : "#FFD700",
      };

      setParticles((prev) => [...prev.slice(-20), newParticle]);
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const newParticle = {
        id: particleId.current++,
        x: touch.clientX,
        y: touch.clientY,
        size: Math.random() * 6 + 2,
        color: Math.random() > 0.5 ? "#D4AF37" : "#FFD700",
      };
      setParticles((prev) => [...prev.slice(-15), newParticle]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isMobile]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* The Magic Wand - Only on Desktop */}
      {!isMobile && (
        <motion.div
          animate={{ x: mousePos.x - 5, y: mousePos.y - 35 }}
          transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
          className="relative"
        >
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.8)] rotate-[-15deg]"
        >
          {/* Wand Body */}
          <path 
            d="M3 21L12 12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          {/* Wand Tip / Crystal */}
          <path 
            d="M12 12L14 10" 
            stroke="#FFF" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          {/* Magic Sparkles around tip */}
          <path d="M15 7L15 3" stroke="currentColor" strokeWidth="1" />
          <path d="M19 11L23 11" stroke="currentColor" strokeWidth="1" />
          <path d="M18 6L21 3" stroke="currentColor" strokeWidth="1" />
        </svg>
        
        {/* Tip Glow */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-gold/40 blur-md rounded-full" />
      </motion.div>
      )}

      {/* Trailing Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: p.x, y: p.y }}
            animate={{ 
              opacity: 0, 
              scale: 0, 
              y: p.y + (Math.random() - 0.5) * 60,
              x: p.x + (Math.random() - 0.5) * 60 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-1 h-1 rounded-full shadow-[0_0_10px_currentColor]"
            style={{ 
              color: p.color,
              backgroundColor: p.color,
              width: p.size,
              height: p.size 
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
