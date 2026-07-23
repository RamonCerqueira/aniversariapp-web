"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface MagicButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function MagicButton({ children, variant = "primary", className = "", ...props }: MagicButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative overflow-hidden px-12 py-6 rounded-full font-cinzel font-bold tracking-[0.2em] uppercase transition-all duration-300
        ${isPrimary 
          ? "bg-gradient-to-b from-gold-light via-gold to-gold-dark text-royal-dark border-2 border-gold-light shadow-[0_5px_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]" 
          : "bg-transparent text-gold border-2 border-gold hover:bg-gold/10 hover:border-gold-light hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
        }
        ${className}
      `}
      {...props}
    >
      {/* Metallic Texture Overlay */}
      {isPrimary && (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-30 mix-blend-overlay" />
      )}

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12" />
      
      {/* Glow Overlay */}
      <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gold/30 blur-md" />

      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">
        {children}
      </span>
    </motion.button>
  );
}
