'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface BrandFormProps {
  onSubmit: (data: BrandInputData) => Promise<void>;
  isLoading: boolean;
}

export interface BrandInputData {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: string;
}

const INDUSTRIES = [
  'Select an industry',
  'Technology',
  'Fashion',
  'Food & Beverage',
  'Health & Wellness',
  'Finance',
  'Education',
  'Entertainment',
  'Real Estate',
  'E-commerce',
  'Travel',
  'Automotive',
  'Other'
];

const TONES = [
  { value: 'modern', label: 'Modern' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'fun', label: 'Fun' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' }
];

export function BrandForm({ onSubmit, isLoading }: BrandFormProps) {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('modern');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim() || !industry || !targetAudience.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    await onSubmit({
      businessName: businessName.trim(),
      industry,
      targetAudience: targetAudience.trim(),
      tone
    });
  };

  return (
    <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle>Create Your Brand Kit</CardTitle>
        <CardDescription>
          Provide details about your business and let AI generate your complete brand identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="businessName" className="block text-sm font-semibold text-gray-900">
              Business Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="businessName"
              placeholder="e.g., Urban Coffee Co., TechFlow, Luna Beauty"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-semibold text-gray-900">
              Industry <span className="text-red-500">*</span>
            </label>
            <Select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isLoading}
              className="text-base"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind === 'Select an industry' ? '' : ind}>
                  {ind}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="targetAudience" className="block text-sm font-semibold text-gray-900">
              Target Audience <span className="text-red-500">*</span>
            </label>
            <Input
              id="targetAudience"
              placeholder="e.g., Young professionals aged 25-40, Eco-conscious entrepreneurs, Fitness enthusiasts"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tone" className="block text-sm font-semibold text-gray-900">
              Brand Tone/Style
            </label>
            <Select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isLoading}
              className="text-base"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose a style that best represents your brand personality
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-8 text-base font-semibold"
          >
            {isLoading ? 'Generating Brand Kit...' : '✨ Generate Brand Kit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
