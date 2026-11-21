'use client';

interface RollTextProps {
  children: string;
  className?: string;
}

export function RollText({ children, className = '' }: RollTextProps) {
  return (
    <span
      className={`relative inline-flex overflow-hidden align-top leading-none ${className}`}
    >
      <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 inline-block translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 motion-reduce:hidden"
      >
        {children}
      </span>
    </span>
  );
}
