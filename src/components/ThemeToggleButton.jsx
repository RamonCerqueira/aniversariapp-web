import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Cake, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggleButton({ className = '' }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${className}`}
      title={isDarkMode ? 'Mudar para Tema Claro (Acender Vela)' : 'Mudar para Tema Escuro (Soprar Vela)'}
    >
      {isDarkMode ? (
        // Dark Mode: Extinguished/Unlit candle cake (candle wick gray)
        <div className="relative flex items-center justify-center mt-1">
          <Cake size={20} className="text-zinc-500" strokeWidth={1.5} />
          {/* Unlit wick */}
          <div className="absolute -top-1.5 w-[2px] h-1.5 bg-zinc-600 rounded-sm" />
        </div>
      ) : (
        // Light Mode: Lit candle cake with animated glowing flame
        <div className="relative flex items-center justify-center mt-1">
          <Cake size={20} className="text-primary" strokeWidth={1.5} />
          {/* Animated candle flame */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 0.95, 1.15, 1], 
              opacity: [0.9, 1, 0.85, 1, 0.9],
              y: [0, -0.8, 0.2, -0.4, 0]
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="absolute -top-2 flex flex-col items-center"
          >
            <Flame size={11} className="text-amber-500 fill-amber-400 stroke-[1.5]" />
          </motion.div>
        </div>
      )}
    </button>
  );
}
