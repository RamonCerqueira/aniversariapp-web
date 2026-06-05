import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export const FormInput = ({ 
  label, 
  error, 
  required = false, 
  className = '',
  ...props 
}) => {
  return (
    <div className="mb-5">
      <Label className="text-sm font-semibold tracking-tight text-foreground/90 mb-2 block">
        {label}
        {required && <span className="text-rose-500 font-bold"> *</span>}
      </Label>
      <Input
        {...props}
        className={`w-full py-6 px-4 rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-foreground/20 hover:bg-background ${error ? 'border-destructive/80 focus:ring-destructive/20 focus:border-destructive' : ''} ${className}`}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-destructive text-xs font-semibold mt-1.5 flex items-center gap-1"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FormTextarea = ({ 
  label, 
  error, 
  required = false, 
  className = '',
  ...props 
}) => {
  return (
    <div className="mb-5">
      <Label className="text-sm font-semibold tracking-tight text-foreground/90 mb-2 block">
        {label}
        {required && <span className="text-rose-500 font-bold"> *</span>}
      </Label>
      <Textarea
        {...props}
        className={`w-full px-4 py-3 rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-foreground/20 hover:bg-background ${error ? 'border-destructive/80 focus:ring-destructive/20 focus:border-destructive' : ''} ${className}`}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-destructive text-xs font-semibold mt-1.5 flex items-center gap-1"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FormSelect = ({ 
  label, 
  error, 
  required = false, 
  placeholder = 'Selecione uma opção',
  options = [],
  value,
  onValueChange,
  ...props 
}) => {
  return (
    <div className="mb-5">
      <Label className="text-sm font-semibold tracking-tight text-foreground/90 mb-2 block">
        {label}
        {required && <span className="text-rose-500 font-bold"> *</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} {...props}>
        <SelectTrigger className={`w-full h-[50px] px-4 rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-foreground/20 hover:bg-background ${error ? 'border-destructive/80 focus:ring-destructive/20 focus:border-destructive' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border shadow-xl">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="rounded-lg my-0.5">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-destructive text-xs font-semibold mt-1.5 flex items-center gap-1"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FormButton = ({ 
  title, 
  loading = false, 
  variant = 'default',
  className = '',
  children,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="flex-1"
    >
      <Button
        {...props}
        variant={variant}
        disabled={loading}
        className={`w-full py-6 rounded-xl font-bold tracking-tight shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
          variant === 'default' 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/10' 
            : 'bg-muted text-foreground hover:bg-muted/80 shadow-muted/5'
        } ${className}`}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Loader2 size={20} />
          </motion.div>
        ) : (
          children || title
        )}
      </Button>
    </motion.div>
  );
};

