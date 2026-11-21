import Image from 'next/image';
import { BrandLogo } from '@/components/BrandLogo';
import { HeroCta } from '@/components/HeroCta';
import { CalmReveal } from '@/components/motion/CalmReveal';

export default function HomePage() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#090d0a] text-white selection:bg-white selection:text-[#0a0a0a]">
      <Image
        src="/images/hero-bloomhaze.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={80}
        className="pointer-events-none select-none object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent"
      />

      <header className="relative z-10 flex items-center px-6 pt-7 sm:px-12 sm:pt-10 lg:px-16">
        <BrandLogo tone="light" />
      </header>

      <section
        aria-labelledby="hero-heading"
        className="absolute inset-x-0 bottom-0 z-10 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-12 sm:pb-14 lg:px-16 lg:pb-16"
      >
        <div className="max-w-lg">
          <CalmReveal>
            <h1
              id="hero-heading"
              className="text-5xl font-semibold tracking-[-0.035em] text-white sm:text-6xl lg:text-[4.25rem] lg:leading-[1.04]"
            >
              Brandify
            </h1>
          </CalmReveal>

          <CalmReveal delay={0.07}>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              Turn a rough business idea into logos, color palettes, and launch
              copy in minutes.
            </p>
          </CalmReveal>

          <CalmReveal delay={0.14} className="mt-7">
            <HeroCta />
          </CalmReveal>
        </div>
      </section>
    </main>
  );
}
