import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export const AnimatedHeader = ({ userName, onNotificationPress }) => {
  return (
    <div className="bg-primary-custom pt-12 pb-6 px-6">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <p className="text-white text-lg">Olá,</p>
          <h1 className="text-white text-2xl font-bold">{userName}</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            delay: 0.3,
            damping: 15,
            stiffness: 150,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationPress}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full"
          >
            <Bell size={24} className="text-white" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

