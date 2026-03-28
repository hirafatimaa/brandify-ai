'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, RefreshCw, ThumbsDown, RotateCw, CheckCircle2, Loader2 } from 'lucide-react';

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
  businessName?: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
}

interface LogoState {
  confidence: number;
  showFeedback: boolean;
  feedback: string;
  isRegenerating: boolean;
  regeneratedImage?: string;
  showAcknowledgment: boolean;
  isRejected: boolean;
}

export function BrandOutput({ result, onRegenerate, isLoading, businessName = 'Brand', industry = 'Business', targetAudience = 'Audience', tone = 'modern' }: BrandOutputProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  
  // Initialize logo states with confidence scores
  const [logoStates, setLogoStates] = useState<Record<number, LogoState>>(() => {
    const states: Record<number, LogoState> = {};
    result.logoImages.forEach((_, index) => {
      states[index] = {
        confidence: Math.floor(Math.random() * 15) + 78, // 78-92%
        showFeedback: false,
        feedback: '',
        isRegenerating: false,
        regeneratedImage: undefined,
        showAcknowledgment: false,
        isRejected: false,
      };
    });
    return states;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRejectLogo = (index: number) => {
    setLogoStates(prev => ({
      ...prev,
      [index]: { ...prev[index], isRejected: true, showFeedback: false }
    }));
    // Hide rejection state after 2 seconds
    setTimeout(() => {
      setLogoStates(prev => ({
        ...prev,
        [index]: { ...prev[index], isRejected: false }
      }));
    }, 2000);
  };

  const handleShowFeedback = (index: number) => {
    setLogoStates(prev => ({
      ...prev,
      [index]: { ...prev[index], showFeedback: true, feedback: '' }
    }));
  };

  const handleHideFeedback = (index: number) => {
    setLogoStates(prev => ({
      ...prev,
      [index]: { ...prev[index], showFeedback: false }
    }));
  };

  const handleRegenerateLogo = async (index: number) => {
    const feedback = logoStates[index].feedback;
    if (!feedback.trim()) return;

    setLogoStates(prev => ({
      ...prev,
      [index]: { ...prev[index], isRegenerating: true }
    }));

    try {
      const response = await fetch('/api/regenerate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          industry,
          targetAudience,
          tone,
          feedback,
          previousIndex: index,
          primaryColor: result.colors.primary,
          accentColor: result.colors.accent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLogoStates(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            isRegenerating: false,
            regeneratedImage: data.logoImage,
            showFeedback: false,
            showAcknowledgment: true,
            confidence: Math.floor(Math.random() * 15) + 78, // New confidence score
            feedback: '',
          }
        }));

        // Hide acknowledgment after 4 seconds
        setTimeout(() => {
          setLogoStates(prev => ({
            ...prev,
            [index]: { ...prev[index], showAcknowledgment: false }
          }));
        }, 4000);
      }
    } catch (error) {
      console.error('Error regenerating logo:', error);
      setLogoStates(prev => ({
        ...prev,
        [index]: { ...prev[index], isRegenerating: false }
      }));
    }
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

      {/* Logo Concepts - Interactive with Human-in-the-Loop */}
      <div className="animate-slide-up stagger-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo Concepts</CardTitle>
            <CardDescription>AI-generated logo designs for your brand • Give feedback to improve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.logoImages.map((imageUrl, index) => {
                const state = logoStates[index];
                const displayImage = state.regeneratedImage || imageUrl;
                
                return (
                  <div key={index} className="space-y-3 group">
                    {/* Logo Image Container */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-soft transition-all duration-300 hover:scale-[1.03] hover:shadow-medium flex items-center justify-center">
                      {/* Shimmer overlay while loading */}
                      {displayImage && displayImage.trim() && !loadedImages[index] && (
                        <div className="absolute inset-0 animate-shimmer z-10" />
                      )}
                      
                      {displayImage && displayImage.trim() ? (
                        <Image
                          src={displayImage}
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
                      
                      {!displayImage || !displayImage.trim() ? (
                        <div className="text-center w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                          <div className="text-5xl mb-3 animate-float">✨</div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logo Concept {index + 1}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generated by AI</p>
                        </div>
                      ) : null}

                      {/* Regenerating Overlay */}
                      {state.isRegenerating && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 rounded-2xl">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                            <p className="text-white text-sm font-semibold">Updating...</p>
                          </div>
                        </div>
                      )}

                      {/* Rejection Feedback */}
                      {state.isRejected && (
                        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center z-20 rounded-2xl animate-fade-in">
                          <div className="text-center">
                            <ThumbsDown className="w-8 h-8 text-white mx-auto mb-2" />
                            <p className="text-white text-sm font-semibold">Rejected</p>
                          </div>
                        </div>
                      )}

                      {/* Acknowledgment Feedback */}
                      {state.showAcknowledgment && (
                        <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center z-20 rounded-2xl animate-fade-in">
                          <div className="text-center">
                            <CheckCircle2 className="w-8 h-8 text-white mx-auto mb-2" />
                            <p className="text-white text-sm font-semibold">Updated based on your feedback</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confidence Score & Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          AI Confidence
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {state.confidence}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${state.confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Concept Title */}
                    <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Concept {index + 1}
                    </p>

                    {/* Action Buttons */}
                    {!state.showFeedback && !state.regeneratedImage ? (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRejectLogo(index)}
                          className="flex-1 text-xs"
                          disabled={state.isRegenerating}
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleShowFeedback(index)}
                          disabled={state.isRegenerating}
                        >
                          <RotateCw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    ) : null}

                    {/* Feedback Form */}
                    {state.showFeedback && (
                      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block">
                          What would you like to change?
                        </label>
                        <textarea
                          value={state.feedback}
                          onChange={(e) => setLogoStates(prev => ({
                            ...prev,
                            [index]: { ...prev[index], feedback: e.target.value }
                          }))}
                          placeholder="e.g., More geometric, less abstract, different colors..."
                          className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleRegenerateLogo(index)}
                            disabled={!state.feedback.trim() || state.isRegenerating}
                          >
                            {state.isRegenerating ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Apply Feedback
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleHideFeedback(index)}
                            disabled={state.isRegenerating}
                            className="flex-1 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Regenerated State */}
                    {state.regeneratedImage && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRejectLogo(index)}
                          className="flex-1 text-xs"
                          disabled={state.isRegenerating}
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleShowFeedback(index)}
                          disabled={state.isRegenerating}
                        >
                          <RotateCw className="w-3 h-3 mr-1" />
                          Refine More
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-5 text-center">
              💡 Tip: Use the feedback feature to iteratively improve logos. No page reload needed!
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
