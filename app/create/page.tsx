import type { Metadata } from 'next';
import { BrandStudio } from '@/components/BrandStudio';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/syne/latin-700.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/barlow-condensed/latin-600.css';
import './guidelines.css';

export const metadata: Metadata = {
  title: 'Create Brand | Brandify',
  description: 'Describe your business to generate logo directions, brand guidelines and production assets.',
};

export default function CreatePage() {
  return <main className="min-h-[100dvh] bg-background text-foreground"><BrandStudio /></main>;
}
