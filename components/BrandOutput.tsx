'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Your Brand Kit</h2>
        <Button
          onClick={onRegenerate}
          variant="secondary"
          size="md"
          disabled={isLoading}
        >
          Regenerate
        </Button>
      </div>

      {/* Tagline */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Brand Tagline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-semibold text-gray-900">{result.tagline}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(result.tagline, 'tagline')}
              className="shrink-0 ml-2"
            >
              {copiedId === 'tagline' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Brand Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <p className="text-gray-700 leading-relaxed text-sm">{result.description}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(result.description, 'description')}
              className="shrink-0"
            >
              {copiedId === 'description' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Color Palette</CardTitle>
          <CardDescription>Premium colors for your brand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(result.colors).map(([name, hex]) => (
              <div key={name} className="space-y-3">
                <div
                  className="w-full aspect-square rounded-lg border-2 border-gray-200 shadow-soft hover:shadow-md transition-shadow cursor-pointer"
                  style={{ backgroundColor: hex }}
                  onClick={() => copyToClipboard(hex, `color-${name}`)}
                  title="Click to copy hex code"
                />
                <div>
                  <p className="text-xs font-medium text-gray-600 capitalize">{name}</p>
                  <p className="text-sm font-mono text-gray-900 font-semibold">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logo Concepts */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Logo Concepts</CardTitle>
          <CardDescription>AI-generated logo designs for your brand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.logoImages.map((imageUrl, index) => (
              <div key={index} className="space-y-3">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-soft hover:shadow-md transition-shadow flex items-center justify-center">
                  {imageUrl && imageUrl.trim() ? (
                    <Image
                      src={imageUrl}
                      alt={`Logo concept ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!imageUrl || !imageUrl.trim() ? (
                    <div className="text-center w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-5xl mb-3">✨</div>
                      <p className="text-sm font-medium text-gray-700">Logo Concept {index + 1}</p>
                      <p className="text-xs text-gray-600 mt-1">Generated by AI</p>
                    </div>
                  ) : null}
                </div>
                <p className="text-center text-sm font-medium text-gray-600">
                  Concept {index + 1}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            💡 Tip: These logo concepts showcase style and composition. Refine them using design tools like Figma or Canva.
          </p>
        </CardContent>
      </Card>

      {/* Instagram Captions */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Instagram Captions</CardTitle>
          <CardDescription>Ready-to-post captions for social media</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.captions.map((caption, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-gray-700 flex-1">{caption}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(caption, `caption-${index}`)}
                  className="shrink-0"
                >
                  {copiedId === `caption-${index}` ? (
                    <Check className="w-4 h-4" />
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
  );
}
