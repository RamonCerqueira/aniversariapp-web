"use client";

import { motion } from "framer-motion";

interface OrnamentalHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function OrnamentalHeading({ title, subtitle, className = "" }: OrnamentalHeadingProps) {
  return (
    <div className={`text-center relative py-12 ${className}`}>
      {/* Top Ornament */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center gap-4 mb-4"
      >
        <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-gold" />
        {/* Apple Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-ruby drop-shadow-md">
          <path d="M12 2C9 2 7 4 7 6C7 7 8 8 9 9C5 10 2 13 2 17C2 21 6 22 12 22C18 22 22 21 22 17C22 13 19 10 15 9C16 8 17 7 17 6C17 4 15 2 12 2ZM12 4C13.5 4 14.5 5 14.5 6C14.5 6.5 14 7 13.5 7C13 7 12 6.5 12 6C12 5.5 11.5 5 11 5C10.5 5 10 5.5 10 6C10 6.5 9 7 8.5 7C8 7 7.5 6.5 7.5 6C7.5 5 8.5 4 10 4C10.5 4 11 3.5 12 4Z" />
          <path d="M12 0L13 3C13 3 14 2 15 2C14 1 13 0 12 0Z" fill="#228B22"/> {/* Leaf */}
        </svg>
        <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-gold" />
      </motion.div>

      {/* Main Title */}
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl md:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark drop-shadow-[0_4px_10px_rgba(184,134,11,0.5)]"
      >
        {title}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 text-pearl/80 font-serif text-lg md:text-xl tracking-widest uppercase"
        >
          {subtitle}
        </motion.p>
      )}

      {/* Bottom Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
    </div>
  );
}
