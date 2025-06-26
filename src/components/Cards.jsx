import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Users, Utensils, CheckCircle, Building } from 'lucide-react';

const iconMap = {
  gift: Gift,
  calendar: Calendar,
  users: Users,
  utensils: Utensils,
  'check-circle': CheckCircle,
  building: Building,
};

export const AnimatedCard = ({ children, delay = 0, className = '', onClick }) => {
  const Component = onClick ? motion.div : motion.div;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: "easeOut"
      }}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              delay: (delay + 200) / 1000,
              damping: 15,
              stiffness: 150,
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <IconComponent size={24} color={iconColor} />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Button 
          onClick={onPress} 
          className="w-full bg-primary-custom hover:bg-primary-custom/90"
        >
          {buttonText}
        </Button>
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
    <AnimatedCard delay={delay} onClick={onPress} className="w-full sm:w-[48%] mb-4">
      <CardContent className="p-4">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{
              type: "spring",
              delay: (delay + 100) / 1000,
              damping: 15,
              stiffness: 150,
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
            style={{ backgroundColor: `${color}20` }}
          >
            <IconComponent size={24} color={color} />
          </motion.div>
          <h4 className="text-base font-semibold text-foreground text-center">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground text-center">
            {subtitle}
          </p>
        </div>
      </CardContent>
    </AnimatedCard>
  );
};

export const ProgressCard = ({ title, items, delay = 0 }) => {
  return (
    <AnimatedCard delay={delay}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <ProgressItem
              key={index}
              title={item.title}
              progress={item.progress}
              delay={delay + (index * 100)}
            />
          ))}
        </div>
      </CardContent>
    </AnimatedCard>
  );
};

const ProgressItem = ({ title, progress, delay = 0 }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-base text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <div className="bg-muted rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 1,
            delay: delay / 1000,
            ease: "easeOut"
          }}
          className="bg-primary-custom rounded-full h-2"
        />
      </div>
    </div>
  );
};

