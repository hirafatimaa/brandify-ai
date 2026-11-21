'use client';

import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SegmentedControl } from '@/components/motion/SegmentedControl';
import { ChoicePills } from '@/components/motion/ChoicePills';
import { readLogoReference } from './logo-reference';

interface BrandFormProps {
  onSubmit: (data: BrandInputData) => Promise<void>;
  isLoading: boolean;
  initialData?: BrandInputData;
}

export interface BrandInputData {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: string;
  logoStylePreference?: string;
  mainProduct?: string;
  logoIdea?: string;
  logoPlacement?: 'digital' | 'print' | 'both';
  colorLimits?: string;
  references?: string[];
  remixReferences?: boolean;
}

const INDUSTRIES = [
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
  'Other',
] as const;

const TONES = [
  { value: 'modern', label: 'Modern' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'fun', label: 'Fun' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
] as const;

const LOGO_STYLES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'playful', label: 'Playful' },
  { value: 'geometric', label: 'Geometric' },
  { value: 'organic', label: 'Organic' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'bold', label: 'Bold' },
] as const;

type FieldErrors = Partial<
  Record<'businessName' | 'industry' | 'targetAudience', string>
>;

export function BrandForm({ onSubmit, isLoading, initialData }: BrandFormProps) {
  const [businessName, setBusinessName] = useState(initialData?.businessName ?? '');
  const [industry, setIndustry] = useState(initialData?.industry ?? '');
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience ?? '');
  const [tone, setTone] = useState<string>(initialData?.tone ?? 'modern');
  const [logoStylePreference, setLogoStylePreference] = useState<string>(initialData?.logoStylePreference ?? 'minimal');
  const [mainProduct, setMainProduct] = useState(initialData?.mainProduct ?? '');
  const [logoIdea, setLogoIdea] = useState(initialData?.logoIdea ?? '');
  const [logoPlacement, setLogoPlacement] = useState(initialData?.logoPlacement ?? 'both');
  const [colorLimits, setColorLimits] = useState(initialData?.colorLimits ?? '');
  const [references, setReferences] = useState(initialData?.references ?? []);
  const [remixReferences, setRemixReferences] = useState(initialData?.remixReferences ?? false);
  const [referenceError, setReferenceError] = useState('');
  const [readingReferences, setReadingReferences] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const businessNameRef = useRef<HTMLInputElement>(null);
  const industryRef = useRef<HTMLSelectElement>(null);
  const targetAudienceRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || readingReferences) return;

    const nextErrors: FieldErrors = {};
    if (!businessName.trim()) {
      nextErrors.businessName = 'Enter a business name to continue.';
    }
    if (!industry) {
      nextErrors.industry = 'Choose an industry for your brand.';
    }
    if (!targetAudience.trim()) {
      nextErrors.targetAudience = 'Describe who you are trying to reach.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.businessName) {
        businessNameRef.current?.focus();
      } else if (nextErrors.industry) {
        industryRef.current?.focus();
      } else if (nextErrors.targetAudience) {
        targetAudienceRef.current?.focus();
      }
      return;
    }

    setErrors({});

    await onSubmit({
      businessName: businessName.trim(),
      industry,
      targetAudience: targetAudience.trim(),
      tone,
      logoStylePreference,
      mainProduct: mainProduct.trim() || undefined,
      logoIdea: logoIdea.trim() || undefined,
      logoPlacement,
      colorLimits: colorLimits.trim() || undefined,
      references,
      remixReferences: references.length > 0 && remixReferences,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-xl space-y-8">
      <div className="space-y-2">
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-foreground"
        >
          Business name
        </label>
        <Input
          ref={businessNameRef}
          id="businessName"
          name="businessName"
          maxLength={64}
          autoComplete="organization"
          placeholder="Urban Coffee Co., TechFlow, Luna Beauty"
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value);
            if (errors.businessName) {
              setErrors((prev) => ({ ...prev, businessName: undefined }));
            }
          }}
          disabled={isLoading}
          aria-required="true"
          aria-invalid={Boolean(errors.businessName)}
          aria-describedby={
            errors.businessName ? 'businessName-error' : undefined
          }
          className={errors.businessName ? 'border-destructive' : ''}
        />
        {errors.businessName && (
          <p
            id="businessName-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {errors.businessName}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="industry"
          className="block text-sm font-medium text-foreground"
        >
          Industry
        </label>
        <Select
          ref={industryRef}
          id="industry"
          name="industry"
          value={industry}
          onChange={(e) => {
            setIndustry(e.target.value);
            if (errors.industry) {
              setErrors((prev) => ({ ...prev, industry: undefined }));
            }
          }}
          disabled={isLoading}
          aria-required="true"
          aria-invalid={Boolean(errors.industry)}
          aria-describedby={errors.industry ? 'industry-error' : undefined}
          className={errors.industry ? 'border-destructive' : ''}
        >
          <option value="">Select an industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </Select>
        {errors.industry && (
          <p id="industry-error" role="alert" className="text-xs text-destructive">
            {errors.industry}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="targetAudience"
          className="block text-sm font-medium text-foreground"
        >
          Target audience
        </label>
        <Input
          ref={targetAudienceRef}
          id="targetAudience"
          name="targetAudience"
          maxLength={240}
          placeholder="Remote founders aged 25-40, specialty coffee drinkers"
          value={targetAudience}
          onChange={(e) => {
            setTargetAudience(e.target.value);
            if (errors.targetAudience) {
              setErrors((prev) => ({ ...prev, targetAudience: undefined }));
            }
          }}
          disabled={isLoading}
          aria-required="true"
          aria-invalid={Boolean(errors.targetAudience)}
          aria-describedby={
            errors.targetAudience ? 'targetAudience-error' : undefined
          }
          className={errors.targetAudience ? 'border-destructive' : ''}
        />
        {errors.targetAudience && (
          <p
            id="targetAudience-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {errors.targetAudience}
          </p>
        )}
      </div>

      <fieldset className="space-y-2.5">
        <legend className="text-sm font-medium text-foreground">
          Brand tone
        </legend>
        <SegmentedControl
          options={TONES}
          value={tone}
          onChange={setTone}
          ariaLabel="Brand tone"
          disabled={isLoading}
        />
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="text-sm font-medium text-foreground">
          Logo style
        </legend>
        <ChoicePills
          options={LOGO_STYLES}
          value={logoStylePreference}
          onChange={setLogoStylePreference}
          ariaLabel="Logo style preference"
          disabled={isLoading}
        />
      </fieldset>

      <div className="space-y-2">
        <label
          htmlFor="mainProduct"
          className="block text-sm font-medium text-foreground"
        >
          Main product or focus{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="mainProduct"
          name="mainProduct"
          maxLength={240}
          placeholder="Single-origin beans, ceramic mugs, subscription roasts"
          value={mainProduct}
          onChange={(e) => setMainProduct(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <details className="border-y border-border py-3" open={initialData?.logoIdea || initialData?.references?.length || initialData?.colorLimits ? true : undefined}>
        <summary className="min-h-9 cursor-pointer py-2 text-sm font-medium">Add logo direction details <span className="text-muted-foreground">(optional)</span></summary>
        <div className="mt-4 space-y-5 pb-3">
          <div className="space-y-2">
            <label htmlFor="logoIdea" className="block text-sm font-medium">An idea for the mark</label>
            <Input id="logoIdea" value={logoIdea} onChange={(event) => setLogoIdea(event.target.value)} maxLength={180} disabled={isLoading} placeholder="A kiln opening, the motion of a wheel, a letter" />
          </div>
          <div className="space-y-2">
            <label htmlFor="logoPlacement" className="block text-sm font-medium">Where the logo will appear</label>
            <Select id="logoPlacement" value={logoPlacement} onChange={(event) => setLogoPlacement(event.target.value as NonNullable<BrandInputData['logoPlacement']>)} disabled={isLoading}>
              <option value="both">Digital and print</option><option value="digital">Digital first</option><option value="print">Print first</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="colorLimits" className="block text-sm font-medium">Color limits</label>
            <Input id="colorLimits" value={colorLimits} onChange={(event) => setColorLimits(event.target.value)} maxLength={120} disabled={isLoading} placeholder="One ink for packaging, no bright red" />
          </div>
          <div className="space-y-2">
            <label htmlFor="logoReferences" className="block text-sm font-medium">Logo references</label>
            <p id="logoReferences-help" className="text-sm text-muted-foreground">Upload up to six cropped individual marks on plain backgrounds. Brandify measures their silhouettes and checks new marks against them.</p>
            <Input id="logoReferences" type="file" multiple accept="image/png,image/jpeg,image/webp" aria-describedby="logoReferences-help" disabled={isLoading || readingReferences} onChange={async (event) => {
              const input = event.currentTarget;
              const files = Array.from(input.files ?? []);
              input.value = '';
              if (!files.length) return;
              if (files.length > 6) { setReferenceError('Choose up to six images.'); return; }
              setReadingReferences(true);
              setReferenceError('');
              try {
                setReferences(await Promise.all(files.map(readLogoReference)));
              } catch (error) {
                setReferenceError(error instanceof Error ? error.message : 'The reference images could not be read.');
              } finally {
                setReadingReferences(false);
              }
            }} />
            {referenceError && <p role="alert" className="text-sm text-destructive">{referenceError}</p>}
            {readingReferences && <p role="status" className="text-sm text-muted-foreground">Measuring references…</p>}
            {references.length > 0 && <div className="flex items-center gap-3 text-sm">
              <span>{references.length} {references.length === 1 ? 'reference' : 'references'} ready</span>
              <button type="button" className="underline underline-offset-2" onClick={() => setReferences([])} disabled={isLoading || readingReferences}>Remove</button>
            </div>}
            {references.length > 0 && <label className="flex items-start gap-2 text-sm leading-relaxed">
              <input type="checkbox" className="mt-1" checked={remixReferences} onChange={(event) => setRemixReferences(event.target.checked)} disabled={isLoading} />
              <span>Include an adapted direction using a reference I have permission to modify. The logo book will identify the source reference.</span>
            </label>}
          </div>
        </div>
      </details>

      <div className="pt-2">
        <Button type="submit" size="lg" isLoading={isLoading} disabled={readingReferences}>
          {isLoading ? (
            'Building guidelines…'
          ) : (
            <>
              <span>Generate brand guidelines</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
