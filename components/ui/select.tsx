import * as React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => (
    <div className="relative w-full">
      <select
        className={`flex h-11 w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground transition-[border-color,box-shadow] duration-150 hover:border-foreground/30 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
);
Select.displayName = 'Select';

export { Select };
