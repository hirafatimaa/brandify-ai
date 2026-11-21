import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
const hex = z.string().regex(/^#[a-f0-9]{6}$/i);
export const fonts = {
  manrope: { name: 'Manrope', weight: 400, file: 'manrope-latin-400-normal.woff', package: 'manrope' },
  syne: { name: 'Syne', weight: 700, file: 'syne-latin-700-normal.woff', package: 'syne' },
  instrument: { name: 'Instrument Serif', weight: 400, file: 'instrument-serif-latin-400-normal.woff', package: 'instrument-serif' },
  barlow: { name: 'Barlow Condensed', weight: 600, file: 'barlow-condensed-latin-600-normal.woff', package: 'barlow-condensed' },
} as const;
const font = z.enum(['manrope', 'syne', 'instrument', 'barlow']);
export type BrandFont = z.infer<typeof font>;

export const briefSchema = z.object({
  businessName: text(64),
  industry: text(80),
  targetAudience: text(240),
  tone: text(60).default('modern'),
  logoStylePreference: text(60).optional(),
  mainProduct: text(240).optional(),
  logoIdea: text(180).optional(),
  logoPlacement: z.enum(['digital', 'print', 'both']).default('both'),
  colorLimits: text(120).optional(),
  // 32 × 32 binary silhouettes from photos cropped to an individual mark.
  references: z.array(z.string().regex(/^[01]{1024}$/)).max(6).default([]),
  remixReferences: z.boolean().default(false),
});
export type BrandBrief = z.infer<typeof briefSchema>;

const grid = z.number().min(0).max(48).multipleOf(0.5);
const operation = z.enum(['add', 'cut']).optional();
const shape = z.discriminatedUnion('shape', [
  z.object({ shape: z.literal('rect'), op: operation, x: grid, y: grid, w: grid, h: grid, r: grid.optional() }),
  z.object({ shape: z.literal('circle'), op: operation, cx: grid, cy: grid, r: grid }),
  z.object({ shape: z.literal('ring'), op: operation, cx: grid, cy: grid, r: grid, width: grid }),
  z.object({ shape: z.literal('polygon'), op: operation, points: z.array(z.tuple([grid, grid])).min(3).max(12) }),
]);
export type Shape = z.infer<typeof shape>;

const color = z.object({ name: text(30), hex, use: text(145) });
const palette = z.object({ ink: color, paper: color, accent: color, neutral: color, tint: color });
export type Palette = z.infer<typeof palette>;

export const directionSchema = z.object({
  title: text(40),
  idea: text(160),
  kind: z.enum(['symbol', 'letter', 'wordmark', 'trace']),
  font,
  tracking: z.number().int().min(-60).max(120),
  palette,
  mark: z.array(shape).max(9),
  reference: z.number().int().min(1).max(6).optional(),
});
export type DirectionRecipe = z.infer<typeof directionSchema>;

export const draftSchema = z.object({
  tagline: text(90),
  introduction: text(450),
  positioning: text(280),
  typography: text(240),
  voice: z.object({
    summary: text(270),
    headline: text(85),
    action: text(45),
    principles: z.array(z.object({ title: text(48), guidance: text(185), example: text(105) })).length(3),
  }),
  applications: z.object({ poster: text(155), social: text(155) }),
  directions: z.array(directionSchema).length(6),
});
export type BrandDraft = z.infer<typeof draftSchema>;

export const projectSchema = z.object({
  brief: briefSchema,
  draft: draftSchema,
  source: z.enum(['gemini', 'local']),
  note: z.string().max(240).optional(),
});
export type BrandProject = z.infer<typeof projectSchema>;

export type LogoCheck = {
  stroke: number;
  counters: [number, number];
  referenceCount: number;
  nearest: number | null;
  faviconReady: boolean;
};

export type LogoDirection = DirectionRecipe & {
  markSvg: string;
  wordmarkSvg: string;
  lockupSvg: string;
  stackedSvg: string;
  checks: LogoCheck;
};

export type BrandResult = BrandProject & { logos: LogoDirection[] };

export const colorKeys = ['ink', 'paper', 'accent', 'neutral', 'tint'] as const;
export const proportions = { ink: 35, paper: 40, accent: 10, neutral: 10, tint: 5 };
export const similarityLimit = 0.8125;

export function rgb(hexColor: string) {
  return [1, 3, 5].map((offset) => parseInt(hexColor.slice(offset, offset + 2), 16));
}

export function cmyk(hexColor: string) {
  const inverted = rgb(hexColor).map((channel) => 1 - channel / 255);
  const black = Math.min(...inverted);
  const inks = black === 1 ? [0, 0, 0] : inverted.map((channel) => (channel - black) / (1 - black));
  return [...inks, black].map((channel) => Math.round(channel * 100));
}

export function contrast(a: string, b: string) {
  const luminance = (value: string) => rgb(value)
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const levels = [luminance(a), luminance(b)].sort((first, second) => second - first);
  return (levels[0] + 0.05) / (levels[1] + 0.05);
}

export function readableOn(background: string) {
  return contrast(background, '#FFFFFF') >= contrast(background, '#000000') ? '#FFFFFF' : '#000000';
}

export function svgUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function recolor(svg: string, fill: string) {
  return svg.replace('fill="currentColor"', `fill="${fill}"`);
}

export function filename(name: string) {
  return name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';
}

export function contrastPairs(palette: Palette) {
  return [
    [palette.ink, palette.paper], [palette.paper, palette.ink],
    [palette.ink, palette.accent], [palette.accent, palette.paper],
    [palette.ink, palette.tint], [palette.ink, palette.neutral],
  ].map(([fg, bg]) => ({ fg, bg, ratio: contrast(fg.hex, bg.hex) }));
}
