import React from 'react';
import { motion } from 'framer-motion';
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
    <div className="mb-4">
      <Label className="text-base font-medium text-foreground mb-2 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        {...props}
        className={`${error ? 'border-destructive' : ''} ${className}`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-destructive text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
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
    <div className="mb-4">
      <Label className="text-base font-medium text-foreground mb-2 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Textarea
        {...props}
        className={`${error ? 'border-destructive' : ''} ${className}`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-destructive text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
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
    <div className="mb-4">
      <Label className="text-base font-medium text-foreground mb-2 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} {...props}>
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-destructive text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
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
    <Button
      {...props}
      variant={variant}
      disabled={loading}
      className={`${className} ${variant === 'default' ? 'bg-primary-custom hover:bg-primary-custom/90' : ''}`}
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
  );
};

