interface CalmRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function CalmReveal({
  children,
  delay = 0,
  className = '',
}: CalmRevealProps) {
  return (
    <div
      className={`calm-reveal ${className}`.trim()}
      style={delay > 0 ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
