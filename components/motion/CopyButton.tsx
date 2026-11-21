'use client';

import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

export function CopyButton({
  copied,
  onClick,
  label,
  className = '',
}: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inline-flex transition-[opacity,transform] duration-150 ${
          copied ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <Copy className="h-4 w-4" />
      </span>
      <span
        aria-hidden="true"
        className={`absolute inline-flex text-emerald-600 transition-[opacity,transform] duration-150 ${
          copied ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <Check className="h-4 w-4" />
      </span>
    </button>
  );
}
