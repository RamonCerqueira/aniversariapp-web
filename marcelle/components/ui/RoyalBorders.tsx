"use client";

import { motion } from "framer-motion";

export default function RoyalBorders() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] hidden lg:block">
      {/* Top Left */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        className="absolute top-8 left-8 w-32 h-32 border-t-4 border-l-4 border-gold/40 rounded-tl-3xl"
      >
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gold rotate-45 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
      </motion.div>

      {/* Top Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        className="absolute top-8 right-8 w-32 h-32 border-t-4 border-r-4 border-gold/40 rounded-tr-3xl"
      >
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rotate-45 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
      </motion.div>

      {/* Bottom Left */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        className="absolute bottom-8 left-8 w-32 h-32 border-b-4 border-l-4 border-gold/40 rounded-bl-3xl"
      >
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gold rotate-45 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
      </motion.div>

      {/* Bottom Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        className="absolute bottom-8 right-8 w-32 h-32 border-b-4 border-r-4 border-gold/40 rounded-br-3xl"
      >
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gold rotate-45 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
      </motion.div>

      {/* Ornamental Center Lines (Subtle) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-gold/60 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-t from-gold/60 to-transparent" />
    </div>
  );
}
