import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => (
    <input
      type={type}
      className={`flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow] duration-150 hover:border-foreground/30 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
