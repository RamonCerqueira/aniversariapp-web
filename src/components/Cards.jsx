import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Users, Utensils, CheckCircle, Building, Wallet } from 'lucide-react';

const iconMap = {
  gift: Gift,
  calendar: Calendar,
  users: Users,
  utensils: Utensils,
  'check-circle': CheckCircle,
  building: Building,
  wallet: Wallet,
};

export const AnimatedCard = ({ children, delay = 0, className = '', onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -4, scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 25 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{
        duration: 0.5,
        delay: delay / 1000,
        ease: [0.21, 1.02, 0.43, 1.01]
      }}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md shadow-lg shadow-black/[0.03] dark:shadow-black/[0.1] hover:shadow-xl dark:border-border/20 transition-all duration-300 overflow-hidden">
        {children}
      </Card>
    </motion.div>
  );
};

export const StatusCard = ({ 
  title, 
  subtitle, 
  icon, 
  iconColor, 
  buttonText, 
  onPress, 
  delay = 0 
}) => {
  const IconComponent = iconMap[icon] || Gift;

  return (
    <AnimatedCard delay={delay}>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                delay: (delay + 150) / 1000,
                damping: 12,
                stiffness: 120,
              }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border border-white/20 dark:border-white/5 flex-shrink-0"
              style={{ backgroundColor: `${iconColor}15`, boxShadow: `0 8px 20px -6px ${iconColor}40` }}
            >
              <IconComponent size={28} color={iconColor} />
            </motion.div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={onPress} 
              className="w-full sm:w-auto px-6 py-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-tight shadow-lg shadow-primary/20"
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </AnimatedCard>
  );
};

export const QuickActionCard = ({ 
  icon, 
  title, 
  subtitle, 
  color, 
  onPress, 
  delay = 0 
}) => {
  const IconComponent = iconMap[icon] || Gift;

  return (
    <AnimatedCard delay={delay} onClick={onPress} className="w-full sm:w-[48%] mb-1">
      <CardContent className="p-5 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            delay: (delay + 100) / 1000,
            damping: 14,
            stiffness: 140,
          }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/20 dark:border-white/5"
          style={{ backgroundColor: `${color}15`, boxShadow: `0 8px 16px -6px ${color}30` }}
        >
          <IconComponent size={26} color={color} />
        </motion.div>
        <h4 className="text-base font-bold tracking-tight text-foreground mb-1">
          {title}
        </h4>
        <p className="text-xs font-medium text-muted-foreground">
          {subtitle}
        </p>
      </CardContent>
    </AnimatedCard>
  );
};

export const ProgressCard = ({ title, items, delay = 0 }) => {
  return (
    <AnimatedCard delay={delay}>
      <CardContent className="p-6 md:p-8">
        <h3 className="text-lg font-bold tracking-tight text-foreground mb-5 flex items-center gap-2">
          🎯 {title}
        </h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <ProgressItem
              key={index}
              title={item.title}
              progress={item.progress}
              delay={delay + (index * 80)}
            />
          ))}
        </div>
      </CardContent>
    </AnimatedCard>
  );
};

const ProgressItem = ({ title, progress, delay = 0 }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-semibold">
        <span className="text-foreground/90">{title}</span>
        <span className="text-xs text-muted-foreground">{progress}%</span>
      </div>
      <div className="bg-muted rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.8,
            delay: delay / 1000,
            ease: "easeOut"
          }}
          className="bg-primary rounded-full h-full"
        />
      </div>
    </div>
  );
};
