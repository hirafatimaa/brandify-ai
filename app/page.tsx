'use client';

import { useState, useRef } from 'react';
import { BrandForm, BrandInputData } from '@/components/BrandForm';
import { BrandOutput, BrandResult } from '@/components/BrandOutput';
import { ArrowLeft } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState<BrandResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastInputData, setLastInputData] = useState<BrandInputData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerateBrand = async (data: BrandInputData) => {
    setIsLoading(true);
    setLastInputData(data);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate brand kit');
      }

      const brandResult = await response.json();
      setResult(brandResult);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.warn('⚠️ [Frontend Fallback Triggered] Network completely failed. Using local offline mock data.', err);
      setResult(generateLocalFallback(data));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastInputData) return;
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lastInputData),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate brand kit');
      }

      const brandResult = await response.json();
      setResult(brandResult);
    } catch (err) {
      console.warn('⚠️ [Frontend Fallback Triggered] Network completely failed during regeneration. Using local offline mock.', err);
      setResult(generateLocalFallback(lastInputData));
    } finally {
      setIsLoading(false);
    }
  };

  // Absolute last-resort fallback if network is fully dead
  const generateLocalFallback = (data: BrandInputData): BrandResult => {
    const name = data.businessName || 'Your Brand';
    const ind = data.industry || 'Business';
    const hue = (name.length * 25) % 360;
    
    return {
      tagline: `Elevating ${ind} for the modern world.`,
      description: `${name} represents the pinnacle of ${data.tone || 'modern'} design. We deliver excellence, innovation, and unforgettable experiences.`,
      colors: {
        primary: `hsl(${hue}, 75%, 50%)`,
        secondary: `hsl(${(hue + 45) % 360}, 60%, 45%)`,
        accent: `hsl(${(hue + 120) % 360}, 80%, 60%)`,
        background: '#FAFAFA',
        text: '#111827'
      },
      captions: [
        `✨ Welcome to ${name}! Your new favorite ${ind.toLowerCase()} brand.`,
        `Premium quality, unforgettable experience.`,
        `Discover what makes us different. Click the link in our bio! 🚀`
      ],
      logoImages: [
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f8fafc"/><circle cx="100" cy="100" r="80" fill="hsl(${hue}, 75%, 50%)" opacity="0.8"/><text x="100" y="120" font-size="52" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="sans-serif">${name.substring(0, 2).toUpperCase()}</text></svg>`)}`,
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f8fafc"/><rect x="25" y="25" width="150" height="150" rx="20" fill="hsl(${hue}, 75%, 50%)" opacity="0.8"/><text x="100" y="120" font-size="52" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="sans-serif">${name.substring(0, 2).toUpperCase()}</text></svg>`)}`,
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f8fafc"/><polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="hsl(${hue}, 75%, 50%)" opacity="0.8"/><text x="100" y="120" font-size="52" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="sans-serif">${name.substring(0, 2).toUpperCase()}</text></svg>`)}`
      ]
    };
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ─── Background decorative elements ─── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-200/30 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[100px] -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.07) 0%, transparent 70%)',
        }}
      ></div>

      {/* ─── Subtle grid pattern overlay ─── */}
      <div className="absolute inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Powered by Google Gemini AI
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-500 bg-clip-text text-transparent mb-5 tracking-tight leading-[1.1]">
            Brandify AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-3 font-semibold">
            Generate Your Complete Brand Identity in Seconds
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
            Create taglines, color palettes, logos, and social media content instantly. No design skills required.
          </p>
        </div>

        {/* Form Section */}
        {!result && (
          <div className="mb-12 animate-slide-up">
            <BrandForm onSubmit={handleGenerateBrand} isLoading={isLoading} />
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !result && (
          <div className="space-y-6 animate-fade-in">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-48 skeleton rounded-2xl"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div ref={resultRef}>
            <div className="mb-8">
              <button
                onClick={() => setResult(null)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold flex items-center gap-2 mb-6 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Start New Brand Kit
              </button>
            </div>
            <BrandOutput
              result={result}
              onRegenerate={handleRegenerate}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </main>
  );
}
