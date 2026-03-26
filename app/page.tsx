'use client';

import { useState, useRef } from 'react';
import { BrandForm, BrandInputData } from '@/components/BrandForm';
import { BrandOutput, BrandResult } from '@/components/BrandOutput';

export default function Home() {
  const [result, setResult] = useState<BrandResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInputData, setLastInputData] = useState<BrandInputData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerateBrand = async (data: BrandInputData) => {
    setIsLoading(true);
    setError(null);
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

      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      console.error('Error generating brand:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastInputData) return;
    
    // Show loading state with current results still visible (subtle change)
    setIsLoading(true);
    setError(null);

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
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      console.error('Error regenerating brand:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 tracking-tight">
            Brandify AI
          </h1>
          <p className="text-xl text-gray-700 mb-2 font-medium">
            Generate Your Complete Brand Identity in Seconds
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powered by Google Gemini AI – create taglines, color palettes, logos, and social media content instantly. No design skills required.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">⚠️ {error}</p>
            <p className="text-red-700 text-sm mt-1">Please try again or check your API key configuration.</p>
          </div>
        )}

        {/* Form Section */}
        {!result && (
          <div className="mb-12">
            <BrandForm onSubmit={handleGenerateBrand} isLoading={isLoading} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !result && (
          <div className="space-y-6 animate-fade-in">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg shadow-soft animate-pulse"
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
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2 mb-6"
              >
                ← Start New Brand Kit
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
