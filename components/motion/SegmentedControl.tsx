'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  className = '',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number; top: number; height: number } | null>(null);
  const hasMeasured = useRef(false);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const activeBtn = buttonRefs.current[value];
    if (!container || !activeBtn) return;

    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();
    setPill({
      left: bRect.left - cRect.left,
      top: bRect.top - cRect.top,
      width: bRect.width,
      height: bRect.height,
    });
  }, [value]);

  useLayoutEffect(() => {
    measure();
    const frame = requestAnimationFrame(() => {
      hasMeasured.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={`relative inline-flex flex-wrap items-center gap-1 rounded-xl bg-muted p-1 ${className}`}
    >
      {pill && (
        <span
          aria-hidden="true"
          style={{
            transform: `translate3d(${pill.left}px, ${pill.top}px, 0)`,
            width: `${pill.width}px`,
            height: `${pill.height}px`,
            transition: hasMeasured.current
              ? 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
          className="pointer-events-none absolute left-0 top-0 z-0 rounded-lg bg-background shadow-xs ring-1 ring-black/[0.04] motion-reduce:transition-none"
        />
      )}
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[option.value] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`relative z-10 min-h-[36px] rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
