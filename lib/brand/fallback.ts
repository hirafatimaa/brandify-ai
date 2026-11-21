import type { BrandBrief, BrandDraft, DirectionRecipe, Palette, Shape } from './model';

const swatches = [
  ['#1B2119', '#F4F3E9', '#C5E368', '#838C77', '#E3E7D7'],
  ['#20231D', '#F3EEE5', '#FA723B', '#AAA08D', '#E9DFD0'],
  ['#18223E', '#F7F6EF', '#FFBD70', '#8B98B1', '#E2E9F8'],
  ['#261C2A', '#F7F1F0', '#FBA6C2', '#A18A9C', '#F0DCE6'],
  ['#252421', '#F3F0E7', '#E8D652', '#A09D90', '#E9E3CE'],
  ['#17302E', '#F2F3EC', '#84D5C3', '#84988F', '#DCEBE4'],
];

const paletteNames = [
  ['Pine Ink', 'Oat Paper', 'Lime Peel', 'Dried Sage', 'Pale Moss'],
  ['Kiln Black', 'Linen', 'Hot Clay', 'Putty', 'Unbleached Paper'],
  ['Midnight', 'Porcelain', 'Apricot', 'Slate', 'Morning Blue'],
  ['Aubergine', 'Rice Paper', 'Guava', 'Heather', 'Petal'],
  ['Charcoal', 'Canvas', 'Saffron', 'Flax', 'Parchment'],
  ['Deep Teal', 'Shell', 'Sea Glass', 'Reed', 'Saltwater'],
];

export function starterPalette(index: number): Palette {
  const [ink, paper, accent, neutral, tint] = swatches[index % swatches.length];
  const names = paletteNames[index % paletteNames.length];
  return {
    ink: { name: names[0], hex: ink, use: 'Use for body type, the primary logo and dense fields with reversed type.' },
    paper: { name: names[1], hex: paper, use: 'Use for reading surfaces and the light version of the logo.' },
    accent: { name: names[2], hex: accent, use: 'Use for a single point of emphasis per layout.' },
    neutral: { name: names[3], hex: neutral, use: 'Use for supporting fields and large graphic details.' },
    tint: { name: names[4], hex: tint, use: 'Use behind secondary content alongside the paper field.' },
  };
}

const visualStudies: Array<{ title: string; idea: string; mark: Shape[] }> = [
  { title: 'Open fold', idea: 'Two broad planes turn around a shared opening.', mark: [
    { shape: 'polygon', points: [[5, 5], [30, 5], [30, 16], [17, 16], [17, 28], [5, 37]] },
    { shape: 'polygon', points: [[43, 11], [43, 43], [18, 43], [18, 32], [31, 32], [31, 20]] },
  ] },
  { title: 'Stepped form', idea: 'Three offset bars give a single assembled form a sense of movement.', mark: [
    { shape: 'polygon', points: [[5, 28], [17, 28], [17, 17], [29, 17], [29, 6], [43, 6], [43, 22], [32, 22], [32, 32], [20, 32], [20, 43], [5, 43]] },
  ] },
  { title: 'Field of two', idea: 'A cut sets a flat edge against a curved silhouette.', mark: [
    { shape: 'circle', cx: 24, cy: 24, r: 19 },
    { shape: 'polygon', op: 'cut', points: [[16, 5], [26, 5], [39, 43], [29, 43]] },
  ] },
  { title: 'Join', idea: 'Two cropped planes meet along a common diagonal.', mark: [
    { shape: 'polygon', points: [[6, 12], [31, 12], [17, 26], [6, 26]] },
    { shape: 'polygon', points: [[42, 19], [42, 36], [17, 36], [32, 19]] },
  ] },
];

export function starterDirections(brief: BrandBrief): DirectionRecipe[] {
  const toneIndex: Record<string, number> = { modern: 0, bold: 1, minimal: 2, luxury: 3, fun: 4 };
  const seed = toneIndex[brief.tone] ?? 0;
  const fontChoices = ['manrope', 'barlow', 'syne', 'instrument'] as const;
  const pictures = visualStudies.map((study, index) => ({
    ...study, kind: 'symbol' as const, font: fontChoices[(seed + index) % fontChoices.length],
    tracking: 0, palette: starterPalette(seed + index),
  }));
  return [
    ...pictures,
    { title: 'Initial', idea: 'A single letter carries the identity into compact spaces.', kind: 'letter', font: 'syne', tracking: -25, palette: starterPalette(seed + 4), mark: [] },
    { title: 'Nameplate', idea: 'A typographic signature designed around the rhythm of the name.', kind: 'wordmark', font: 'barlow', tracking: 35, palette: starterPalette(seed + 5), mark: [] },
  ];
}

export function localDraft(brief: BrandBrief): BrandDraft {
  const { businessName, industry, targetAudience, mainProduct } = brief;
  const label = mainProduct || industry;
  return {
    tagline: mainProduct ? `${mainProduct.slice(0, 88)}.` : `${industry} for ${targetAudience}`.slice(0, 90),
    introduction: `${businessName} is a ${industry.toLowerCase()} brand for ${targetAudience}.${mainProduct ? ` Its first focus is ${mainProduct}.` : ''}`.slice(0, 450),
    positioning: `Lead with ${label} and explain the specific situation in which ${targetAudience} would use it.`.slice(0, 280),
    typography: 'Set the lead line in the display face. Use Manrope Regular for instructions, details and longer copy.',
    voice: {
      summary: `Talk directly to ${targetAudience.slice(0, 200)}. Start with the offer and name the action a reader can take next.`,
      headline: `${label.slice(0, 60)}, by ${businessName}`.slice(0, 85),
      action: `Explore ${businessName}`.slice(0, 45),
      principles: [
        { title: 'Name the offer', guidance: 'Use the name of the product or service in the first line.', example: `Explore ${label.slice(0, 75)}.` },
        { title: 'Use an action verb', guidance: 'Name one next step for each screen or message.', example: 'See how it works.' },
        { title: 'Give the useful detail', guidance: 'Add a date, format or next step when the reader has a decision to make.', example: 'Reply with your preferred date.' },
      ],
    },
    applications: {
      poster: 'Give the headline most of the field. Keep the signature aligned to the supporting text.',
      social: 'Use the symbol by itself for the avatar. Carry the full name and one message on the social tile.',
    },
    directions: starterDirections(brief),
  };
}
