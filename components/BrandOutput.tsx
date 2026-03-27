'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, RefreshCw } from 'lucide-react';

export interface BrandResult {
  tagline: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  captions: string[];
  logoImages: string[];
}

interface BrandOutputProps {
  result: BrandResult;
  onRegenerate: () => void;
  isLoading?: boolean;
}

export function BrandOutput({ result, onRegenerate, isLoading }: BrandOutputProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Brand Kit
        </h2>
        <Button
          onClick={onRegenerate}
          variant="secondary"
          size="md"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>

      {/* Tagline */}
      <div className="animate-slide-up stagger-1" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand Tagline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.tagline}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(result.tagline, 'tagline')}
                className="shrink-0 ml-3"
              >
                {copiedId === 'tagline' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <div className="animate-slide-up stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{result.description}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(result.description, 'description')}
                className="shrink-0"
              >
                {copiedId === 'description' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color Palette */}
      <div className="animate-slide-up stagger-3" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Color Palette</CardTitle>
            <CardDescription>Premium colors for your brand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {Object.entries(result.colors).map(([name, hex]) => (
                <div key={name} className="space-y-3 group">
                  <div
                    className="w-full aspect-square rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 shadow-soft cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-medium hover:rounded-xl hover:z-10 relative"
                    style={{ backgroundColor: hex }}
                    onClick={() => copyToClipboard(hex, `color-${name}`)}
                    title="Click to copy hex code"
                  >
                    {copiedId === `color-${name}` && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl animate-fade-in">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize tracking-wide">{name}</p>
                    <p className="text-base font-mono font-bold text-gray-900 dark:text-white mt-0.5">{hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logo Concepts */}
      <div className="animate-slide-up stagger-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo Concepts</CardTitle>
            <CardDescription>AI-generated logo designs for your brand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.logoImages.map((imageUrl, index) => (
                <div key={index} className="space-y-3 group">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-soft transition-all duration-300 hover:scale-[1.03] hover:shadow-medium flex items-center justify-center">
                    {/* Shimmer overlay while loading */}
                    {imageUrl && imageUrl.trim() && !loadedImages[index] && (
                      <div className="absolute inset-0 animate-shimmer z-10" />
                    )}
                    {imageUrl && imageUrl.trim() ? (
                      <Image
                        src={imageUrl}
                        alt={`Logo concept ${index + 1}`}
                        fill
                        className="object-cover transition-opacity duration-500"
                        style={{ opacity: loadedImages[index] ? 1 : 0 }}
                        unoptimized
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [index]: true }))}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!imageUrl || !imageUrl.trim() ? (
                      <div className="text-center w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <div className="text-5xl mb-3 animate-float">✨</div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logo Concept {index + 1}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generated by AI</p>
                      </div>
                    ) : null}
                  </div>
                  <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Concept {index + 1}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-5 text-center">
              💡 Tip: These logo concepts showcase style and composition. Refine them using design tools like Figma or Canva.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instagram Captions */}
      <div className="animate-slide-up stagger-5" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instagram Captions</CardTitle>
            <CardDescription>Ready-to-post captions for social media</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.captions.map((caption, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 p-5 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{caption}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(caption, `caption-${index}`)}
                    className="shrink-0"
                  >
                    {copiedId === `caption-${index}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
