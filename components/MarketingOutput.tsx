'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, RefreshCw, Instagram, Linkedin, Mail } from 'lucide-react';

export interface MarketingResult {
  instagramPosts: InstagramPost[];
  linkedinPosts: LinkedInPost[];
  leadGeneration: LeadGeneration;
}

interface InstagramPost {
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  imageUrl?: string;
  simulatedComments: string[];
  aiReplies: string[];
}

interface LinkedInPost {
  caption: string;
  imagePrompt: string;
  imageUrl?: string;
  cta: string;
  simulatedComments: string[];
  aiReplies: string[];
}

interface LeadGeneration {
  coldDM: string;
  followUpDM: string;
  leadReply: string;
  closingMessage: string;
}

interface MarketingOutputProps {
  result: MarketingResult;
  onRegenerate: () => void;
  isLoading?: boolean;
}

export function MarketingOutput({ result, onRegenerate, isLoading }: MarketingOutputProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instagram' | 'linkedin' | 'leads'>('instagram');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Marketing Kit
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ready-to-post content for social media & lead generation
          </p>
        </div>
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('instagram')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'instagram'
              ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Instagram className="w-4 h-4" />
          Instagram
        </button>
        <button
          onClick={() => setActiveTab('linkedin')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'linkedin'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'leads'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          Lead Gen
        </button>
      </div>

      {/* Instagram Posts */}
      {activeTab === 'instagram' && (
        <div className="space-y-6 animate-fade-in">
          {result.instagramPosts.map((post, idx) => (
            <div key={idx} className="animate-slide-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: `${idx * 100}ms` }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    Instagram Post {idx + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Caption */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Caption</h4>
                    <div className="flex items-start gap-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex-1 leading-relaxed">{post.caption}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(post.caption, `ig-caption-${idx}`)}
                      >
                        {copiedId === `ig-caption-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Image Display */}
                  {post.imageUrl && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Generated Image</h4>
                      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                        <img 
                          src={post.imageUrl} 
                          alt="Instagram post visual" 
                          className="w-full h-auto max-h-80 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs px-3 py-1 bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Image Prompt */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Image Prompt (for AI generation)</h4>
                    <div className="flex items-start gap-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 flex-1 italic leading-relaxed">{post.imagePrompt}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(post.imagePrompt, `ig-image-${idx}`)}
                      >
                        {copiedId === `ig-image-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Comments & Replies */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Engagement Preview</h4>
                    {post.simulatedComments.map((comment, i) => (
                      <div key={i} className="mb-3 last:mb-0">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">💬 Comment:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">🤖 Your Reply:</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{post.aiReplies[i]}</p>
                        {i < post.simulatedComments.length - 1 && <div className="my-3 border-t border-gray-200 dark:border-gray-700" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* LinkedIn Posts */}
      {activeTab === 'linkedin' && (
        <div className="space-y-6 animate-fade-in">
          {result.linkedinPosts.map((post, idx) => (
            <div key={idx} className="animate-slide-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: `${idx * 100}ms` }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    LinkedIn Post {idx + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Caption */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Post Content</h4>
                    <div className="flex items-start gap-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex-1 leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(post.caption, `li-caption-${idx}`)}
                      >
                        {copiedId === `li-caption-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Call-to-Action</h4>
                    <div className="flex items-start gap-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 flex-1">{post.cta}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(post.cta, `li-cta-${idx}`)}
                      >
                        {copiedId === `li-cta-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Image Display */}
                  {post.imageUrl && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Generated Image</h4>
                      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                        <img 
                          src={post.imageUrl} 
                          alt="LinkedIn post visual" 
                          className="w-full h-auto max-h-80 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Prompt */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Image Prompt</h4>
                    <div className="flex items-start gap-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 flex-1 italic leading-relaxed">{post.imagePrompt}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(post.imagePrompt, `li-image-${idx}`)}
                      >
                        {copiedId === `li-image-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Comments & Replies */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Engagement Preview</h4>
                    {post.simulatedComments.map((comment, i) => (
                      <div key={i} className="mb-3 last:mb-0">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">💬 Comment:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">🤖 Your Reply:</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{post.aiReplies[i]}</p>
                        {i < post.simulatedComments.length - 1 && <div className="my-3 border-t border-gray-200 dark:border-gray-700" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Lead Generation */}
      {activeTab === 'leads' && (
        <div className="space-y-6 animate-fade-in">
          {/* Cold DM */}
          <div className="animate-slide-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                  1. Cold Outreach
                </CardTitle>
                <CardDescription>First contact message for new leads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex-1 leading-relaxed whitespace-pre-wrap">{result.leadGeneration.coldDM}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.leadGeneration.coldDM, 'cold-dm')}
                  >
                    {copiedId === 'cold-dm' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Follow-up DM */}
          <div className="animate-slide-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '100ms' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                  2. Follow-up Message
                </CardTitle>
                <CardDescription>Send if no response to first message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex-1 leading-relaxed whitespace-pre-wrap">{result.leadGeneration.followUpDM}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.leadGeneration.followUpDM, 'followup-dm')}
                  >
                    {copiedId === 'followup-dm' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Reply */}
          <div className="animate-slide-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '200ms' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                  3. Positive Response Reply
                </CardTitle>
                <CardDescription>When lead shows interest</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex-1 leading-relaxed whitespace-pre-wrap">{result.leadGeneration.leadReply}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.leadGeneration.leadReply, 'lead-reply')}
                  >
                    {copiedId === 'lead-reply' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Closing Message */}
          <div className="animate-slide-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '300ms' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                  4. Closing Message
                </CardTitle>
                <CardDescription>To convert lead into customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex-1 leading-relaxed whitespace-pre-wrap">{result.leadGeneration.closingMessage}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.leadGeneration.closingMessage, 'closing-msg')}
                  >
                    {copiedId === 'closing-msg' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
