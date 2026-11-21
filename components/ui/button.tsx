import * as React from 'react';
import { Loader2 } from 'lucide-react';

const buttonVariants = ({
  variant = 'default',
  size = 'md',
}: {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
} = {}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-[background-color,color,border-color,opacity,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
    outline:
      'border border-border bg-background text-foreground hover:bg-muted',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  };

  const sizes = {
    sm: 'min-h-[34px] px-3.5 py-1.5 text-xs',
    md: 'min-h-[42px] px-5 py-2.5 text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-sm',
  };

  return `${baseStyles} ${variants[variant]} ${sizes[size]}`;
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = '', variant, size, isLoading, disabled, children, ...props },
    ref
  ) => (
    <button
      className={`${buttonVariants({ variant, size })} ${className}`.trim()}
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
