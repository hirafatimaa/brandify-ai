import Link from 'next/link';

interface BrandLogoProps {
  tone?: 'dark' | 'light';
  href?: string;
}

export function BrandLogo({ tone = 'dark', href = '/' }: BrandLogoProps) {
  const isLight = tone === 'light';

  const content = (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
          isLight ? 'bg-white text-[#0a0a0a]' : 'bg-foreground text-background'
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="4.5" cy="6" r="3" fill="currentColor" />
          <circle cx="8.5" cy="6" r="2" fill="currentColor" opacity="0.45" />
        </svg>
      </span>
      <span
        className={`text-[15px] font-semibold tracking-[-0.02em] ${
          isLight ? 'text-white' : 'text-foreground'
        }`}
      >
        Brandify
      </span>
    </span>
  );

  return (
    <Link
      href={href}
      aria-label="Brandify home"
      className="inline-flex items-center rounded-md py-1 transition-opacity duration-150 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
    >
      {content}
    </Link>
  );
}
