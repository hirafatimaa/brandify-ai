'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { BrandForm, type BrandInputData } from '@/components/BrandForm';
import { BrandLogo } from '@/components/BrandLogo';
import type { BrandResult } from '@/lib/brand/model';
import type { MarketingResult } from '@/components/MarketingOutput';
import { Button } from '@/components/ui/button';
import { CalmReveal } from '@/components/motion/CalmReveal';

const BrandOutput = dynamic(() => import('@/components/BrandOutput').then((module) => module.BrandOutput), {
  loading: () => <p className="guide-shell pt-10" role="status">Opening brand guidelines…</p>,
});
const MarketingOutput = dynamic(() => import('@/components/MarketingOutput').then((module) => module.MarketingOutput), {
  loading: () => <p role="status">Opening marketing kit…</p>,
});

export function BrandStudio() {
  const [result, setResult] = useState<BrandResult | null>(null);
  const [lastInput, setLastInput] = useState<BrandInputData>();
  const [marketingKit, setMarketingKit] = useState<MarketingResult | null>(null);
  const [view, setView] = useState<'brief' | 'brand' | 'marketing'>('brief');
  const [working, setWorking] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState('');
  const viewStart = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewStart.current) return;
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'instant' });
    viewStart.current?.focus({ preventScroll: true });
  }, [view]);

  async function generate(data: BrandInputData) {
    if (working) return;
    setWorking(true);
    setError('');
    setLastInput(data);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'The brand could not be generated.');
      setResult(body);
      setSelected(0);
      setMarketingKit(null);
      setRevision((current) => current + 1);
      setView('brand');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The brand could not be generated. Try again.');
    } finally {
      setWorking(false);
    }
  }

  async function generateMarketing() {
    if (!lastInput || working) return;
    setWorking(true);
    try {
      const { businessName, industry, targetAudience, tone } = lastInput;
      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, industry, targetAudience, tone }),
      });
      if (!response.ok) throw new Error('Marketing kit generation failed');
      setMarketingKit(await response.json());
    } catch {
      setMarketingKit(generateMarketingFallback(lastInput));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div ref={viewStart} tabIndex={-1} className="focus:outline-none">
      {view === 'brand' && result && <>
        <BrandOutput
          key={revision}
          result={result}
          busy={working}
          selected={selected}
          onSelect={setSelected}
          onEdit={() => { setError(''); setView('brief'); }}
          onRetry={() => { if (lastInput) void generate(lastInput); }}
          onMarketing={() => setView('marketing')}
        />
        {error && <p role="alert" className="guide-export-error">{error}</p>}
      </>}

      {view === 'brief' && (
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-8 sm:px-10 sm:pt-10">
          <header><BrandLogo tone="dark" /></header>
          <section aria-labelledby="form-heading" className="mt-16 sm:mt-24">
            <CalmReveal>
              <h1 id="form-heading" className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Tell us about your brand</h1>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">Share the basics for six logo directions, a brand manual and production assets.</p>
            </CalmReveal>
            <CalmReveal delay={0.06} className="mt-12">
              <BrandForm key={revision} initialData={lastInput} onSubmit={generate} isLoading={working} />
            </CalmReveal>
            {working && <p role="status" className="mt-6 text-sm text-muted-foreground">Designing your identity and checking the marks…</p>}
            {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
          </section>
        </div>
      )}

      {view === 'marketing' && (
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-8 sm:px-10">
          <button type="button" onClick={() => setView('brand')} className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} aria-hidden="true" /> Brand guidelines
          </button>
          {marketingKit ? (
            <MarketingOutput result={marketingKit} onRegenerate={generateMarketing} isLoading={working} />
          ) : (
            <section aria-labelledby="marketing-heading" className="space-y-4">
              <h1 id="marketing-heading" className="text-3xl font-semibold">Marketing kit</h1>
              <p className="text-muted-foreground">Draft Instagram posts, LinkedIn copy and outreach messages for {lastInput?.businessName}.</p>
              <Button type="button" onClick={generateMarketing} isLoading={working}>{working ? 'Generating…' : 'Generate marketing kit'}</Button>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function generateMarketingFallback(data: BrandInputData): MarketingResult {
  const name = data.businessName || 'Your Brand';
  const ind = data.industry || 'business';

  return {
    instagramPosts: [
      {
        caption: `Introducing ${name}. A straightforward take on ${ind.toLowerCase()} made for ${data.targetAudience || 'modern teams'}.`,
        hashtags: [
          `#${name.replace(/\s/g, '')}`,
          `#${ind.replace(/\s/g, '')}`,
        ],
        imagePrompt: `Minimal editorial product photograph for ${name}`,
        simulatedComments: ['Clean look.', 'Where can I try this?'],
        aiReplies: ['Thanks for checking it out.', 'Link is in the bio.'],
      },
    ],
    linkedinPosts: [
      {
        caption: `We just launched ${name} to solve a simple gap in ${ind.toLowerCase()}.\n\nBuilt for ${data.targetAudience || 'teams who value clarity'}.`,
        imagePrompt: `Clean studio brand visual for ${name}`,
        cta: 'Reply here if you want early access.',
        simulatedComments: ['Congrats on the launch.'],
        aiReplies: ['Appreciate it. Happy to share a walkthrough.'],
      },
    ],
    leadGeneration: {
      coldDM: `Hi, I saw your work in ${ind.toLowerCase()}. We built ${name} for ${data.targetAudience || 'teams like yours'}. Open to a quick look?`,
      followUpDM: `Following up on ${name} in case you had a minute this week.`,
      leadReply: `Sure, send over a short overview.`,
      closingMessage: `Sending a 2-minute breakdown now. Let me know if a 15-minute call Thursday works.`,
    },
  };
}
