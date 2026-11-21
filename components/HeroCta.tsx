'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Magnetic } from '@/components/motion/Magnetic';
import { RollText } from '@/components/motion/RollText';

export function HeroCta() {
  return (
    <Magnetic strength={0.14}>
      <Link
        href="/create"
        className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#0a0a0a] shadow-soft transition-[background-color,transform] duration-200 ease-out hover:bg-white/95 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <RollText>Start a brand</RollText>
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </Magnetic>
  );
}
