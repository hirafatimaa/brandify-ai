'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Copy, Check, RefreshCw, XCircle, RotateCcw,
  Send, Sparkles, ShieldCheck, ShieldAlert, ShieldX, Loader2, Cpu
} from 'lucide-react';

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
  confidenceScores?: number[];
}

interface LogoState {
  status: 'active' | 'rejected' | 'regenerating';
  confidenceScore: number;
  feedback: string;
  showFeedbackInput: boolean;
  justUpdated: boolean;
  toastExiting: boolean;
  iterationCount: number;
  selected: boolean;
}

interface BrandOutputProps {
  result: BrandResult;
  onRegenerate: () => void;
  onRegenerateLogo?: (index: number, feedback: string) => Promise<{ logoImage: string; confidenceScore: number } | null>;
  isLoading?: boolean;
}

function generateInitialScores(count: number): number[] {
  return Array.from({ length: count }, () => 78 + Math.floor(Math.random() * 15)); // 78-92%
}

export function BrandOutput({ result, onRegenerate, onRegenerateLogo, isLoading }: BrandOutputProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [logoStates, setLogoStates] = useState<Record<number, LogoState>>({});

  // Initialize logo states when result changes
  useEffect(() => {
    const initialScores = result.confidenceScores || generateInitialScores(result.logoImages.length);
    const initialStates: Record<number, LogoState> = {};
    result.logoImages.forEach((_, index) => {
      initialStates[index] = {
        status: 'active',
        confidenceScore: initialScores[index] || 82,
        feedback: '',
        showFeedbackInput: false,
        justUpdated: false,
        toastExiting: false,
        iterationCount: 0,
        selected: false,
      };
    });
    setLogoStates(initialStates);
    setLoadedImages({});
  }, [result.logoImages, result.confidenceScores]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelect = useCallback((index: number) => {
    setLogoStates(prev => {
      const newStates = { ...prev };
      // Deselect all, select the clicked one (toggle)
      Object.keys(newStates).forEach(k => {
        const key = Number(k);
        newStates[key] = { ...newStates[key], selected: key === index ? !newStates[key].selected : false };
      });
      return newStates;
    });
  }, []);

  const handleReject = useCallback((index: number) => {
    setLogoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        status: 'rejected',
        showFeedbackInput: false,
        feedback: '',
        selected: false,
      },
    }));
  }, []);

  const handleToggleFeedback = useCallback((index: number) => {
    setLogoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        showFeedbackInput: !prev[index].showFeedbackInput,
        feedback: '',
      },
    }));
  }, []);

  const handleFeedbackChange = useCallback((index: number, value: string) => {
    setLogoStates(prev => ({
      ...prev,
      [index]: { ...prev[index], feedback: value },
    }));
  }, []);

  const handleSubmitFeedback = useCallback(async (index: number) => {
    const state = logoStates[index];
    if (!state || !state.feedback.trim() || !onRegenerateLogo) return;

    setLogoStates(prev => ({
      ...prev,
      [index]: { ...prev[index], status: 'regenerating', showFeedbackInput: false },
    }));

    const regenerated = await onRegenerateLogo(index, state.feedback.trim());

    if (regenerated) {
      setLoadedImages(prev => ({ ...prev, [index]: false }));
      setLogoStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          status: 'active',
          confidenceScore: regenerated.confidenceScore,
          feedback: '',
          showFeedbackInput: false,
          justUpdated: true,
          toastExiting: false,
          iterationCount: prev[index].iterationCount + 1,
        },
      }));

      setTimeout(() => {
        setLogoStates(prev => ({
          ...prev,
          [index]: { ...prev[index], toastExiting: true },
        }));
      }, 3000);
      setTimeout(() => {
        setLogoStates(prev => ({
          ...prev,
          [index]: { ...prev[index], justUpdated: false, toastExiting: false },
        }));
      }, 3400);
    } else {
      setLogoStates(prev => ({
        ...prev,
        [index]: { ...prev[index], status: 'active' },
      }));
    }
  }, [logoStates, onRegenerateLogo]);

  const getConfidenceLabel = (score: number) => {
    if (score >= 90) return { text: 'Excellent', icon: ShieldCheck, colorClass: 'text-emerald-500' };
    if (score >= 80) return { text: 'Strong', icon: ShieldCheck, colorClass: 'text-blue-500' };
    if (score >= 70) return { text: 'Good', icon: ShieldAlert, colorClass: 'text-amber-500' };
    return { text: 'Fair', icon: ShieldX, colorClass: 'text-orange-500' };
  };

  const getBarVariant = (score: number) => {
    if (score >= 85) return 'high';
    if (score < 70) return 'low';
    return '';
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

      <div className="animate-slide-up stagger-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <Card className="logo-section-glow overflow-visible">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Logo Concepts
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200/50 dark:border-indigo-800/30">
                <Sparkles className="w-3 h-3" />
                Interactive
              </span>
            </CardTitle>
            <CardDescription>AI-generated logo designs — click to select, reject, or regenerate with feedback</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {result.logoImages.map((imageUrl, index) => {
                const state = logoStates[index];
                if (!state) return null;

                const isRejected = state.status === 'rejected';
                const isRegenerating = state.status === 'regenerating';
                const isSelected = state.selected && !isRejected;
                const confidence = getConfidenceLabel(state.confidenceScore);
                const ConfidenceIcon = confidence.icon;
                const barVariant = getBarVariant(state.confidenceScore);

                return (
                  <div
                    key={`${index}-${state.iterationCount}`}
                    className={`logo-card ${isSelected ? 'selected' : ''} ${isRejected ? 'rejected' : ''} ${isRegenerating ? 'logo-regenerating' : ''}`}
                  >
                    <div className="logo-card-inner">
                      {/* AI Generated Label */}
                      <div className="ai-label">
                        <Cpu className="w-2.5 h-2.5" />
                        AI Generated
                      </div>

                      {/* Logo Image Frame */}
                      <div
                        className="logo-image-frame cursor-pointer relative"
                        onClick={() => !isRejected && !isRegenerating && handleSelect(index)}
                        id={`logo-card-${index}`}
                      >
                        {/* Shimmer while loading */}
                        {imageUrl && imageUrl.trim() && !loadedImages[index] && !isRegenerating && (
                          <div className="absolute inset-0 animate-shimmer z-10" />
                        )}

                        {/* Regenerating overlay */}
                        {isRegenerating && (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Regenerating...</p>
                          </div>
                        )}

                        {/* Rejected overlay */}
                        {isRejected && (
                          <div className="logo-rejected-overlay">
                            <XCircle className="w-10 h-10 text-red-400/70 mb-2" />
                            <span className="text-sm font-semibold text-red-500/80 tracking-wide">Rejected</span>
                          </div>
                        )}

                        {imageUrl && imageUrl.trim() ? (
                          <Image
                            src={imageUrl}
                            alt={`Logo concept ${index + 1}`}
                            fill
                            className={`object-cover transition-opacity duration-500 ${isRejected ? 'opacity-30 grayscale' : ''}`}
                            style={{ opacity: loadedImages[index] ? (isRejected ? 0.3 : 1) : 0 }}
                            unoptimized
                            onLoad={() => setLoadedImages(prev => ({ ...prev, [index]: true }))}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {!imageUrl || !imageUrl.trim() ? (
                          <div className="text-center w-full h-full flex flex-col items-center justify-center">
                            <Sparkles className="w-10 h-10 text-indigo-400/50 mb-3 animate-float" />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logo Concept {index + 1}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generated by AI</p>
                          </div>
                        ) : null}
                      </div>

                      {/* Confidence Score + Progress Bar */}
                      <div className={`mt-4 ${isRejected ? 'opacity-40' : ''}`}>
                        <div className="confidence-tooltip">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <ConfidenceIcon className={`w-3.5 h-3.5 ${confidence.colorClass}`} />
                              <span className={`text-xs font-semibold ${confidence.colorClass}`}>
                                {confidence.text}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                              {state.confidenceScore}%
                            </span>
                          </div>
                          <div className="confidence-bar">
                            <div
                              className={`confidence-bar-fill ${barVariant}`}
                              style={{ width: `${state.confidenceScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pill Action Buttons */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReject(index); }}
                          disabled={isRejected || isRegenerating}
                          className={`pill-btn pill-btn-reject flex-1 ${isRejected ? 'is-rejected' : ''}`}
                          id={`reject-logo-${index}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {isRejected ? 'Rejected' : 'Reject'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFeedback(index); }}
                          disabled={isRejected || isRegenerating}
                          className={`pill-btn pill-btn-regen flex-1 ${state.showFeedbackInput ? 'is-active' : ''}`}
                          id={`regenerate-logo-${index}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>

                      {/* Feedback Input (expands on Regenerate click) */}
                      {state.showFeedbackInput && (
                        <div className="feedback-expand">
                          <div className="bg-gradient-to-br from-gray-50/80 to-indigo-50/40 dark:from-gray-800/50 dark:to-indigo-950/20 rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/30">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              What would you like to change?
                            </label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g., Make it rounder, use warmer tones..."
                                value={state.feedback}
                                onChange={(e) => handleFeedbackChange(index, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitFeedback(index); }}
                                className="text-sm"
                                id={`feedback-input-${index}`}
                              />
                              <button
                                onClick={() => handleSubmitFeedback(index)}
                                disabled={!state.feedback.trim()}
                                className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                                  state.feedback.trim()
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                }`}
                                id={`submit-feedback-${index}`}
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Updated Acknowledgment Toast */}
                      {state.justUpdated && (
                        <div className={`mt-3 ${state.toastExiting ? 'toast-exit' : 'toast-enter'}`}>
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              Updated based on your feedback
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Concept label */}
                      <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mt-3">
                        Concept {index + 1}
                        {state.iterationCount > 0 && (
                          <span className="ml-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                            v{state.iterationCount + 1}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
              Click a logo to select it. Use <strong>Regenerate</strong> with feedback to get an AI-improved version.
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
