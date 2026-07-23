"use client";

import { motion } from "framer-motion";

interface RoyalCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function RoyalCard({ children, className = "", delay = 0 }: RoyalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative p-8 bg-pearl-cream text-royal-dark border-4 border-double border-gold rounded-xl shadow-[var(--shadow-wine)] group overflow-hidden ${className}`}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply" />
      
      {/* Inner Border */}
      <div className="absolute inset-3 border border-gold/40 rounded-lg pointer-events-none" />

      {/* Corner Ornaments */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-gold rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-gold rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-gold rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-gold rounded-br-lg" />

      {/* Decorative Arabesque (Top Center) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-[url('https://img.freepik.com/free-vector/luxury-ornamental-design_1017-27929.jpg')] opacity-10 bg-contain bg-no-repeat bg-center pointer-events-none" />

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {children}
      </div>
    </motion.div>
  );
}
