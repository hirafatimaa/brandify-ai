import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import fontkit, { type Font } from '@pdf-lib/fontkit';
import { Resvg } from '@resvg/resvg-js';
import { contrast, fonts, recolor, similarityLimit, type BrandFont, type BrandProject, type DirectionRecipe, type LogoDirection, type Shape } from './model';
import { starterDirections, starterPalette } from './fallback';
import { inspect, normalizedSilhouette, prepareReferenceSet, silhouetteOverlap, silhouettes, similarity } from './checks';

export function fontAsset(font: BrandFont, license = false) {
  const selection = fonts[font];
  return readFileSync(join(process.cwd(), 'node_modules', '@fontsource', selection.package, license ? 'LICENSE' : `files/${selection.file}`));
}

const fontCache = new Map<BrandFont, Font>();
function outlineFont(id: BrandFont) {
  const cached = fontCache.get(id);
  if (cached) return cached;
  const font = fontkit.create(fontAsset(id));
  fontCache.set(id, font);
  return font;
}

const round = (value: number) => Number(value.toFixed(3));

function wordArtwork(value: string, id: BrandFont, tracking: number) {
  const font = outlineFont(id);
  const layout = font.layout(value);
  const glyphs: string[] = [];
  let x = 0;
  let left = Infinity;
  let right = -Infinity;
  let top = -Infinity;
  let bottom = Infinity;
  for (const [index, glyph] of layout.glyphs.entries()) {
    const position = layout.positions[index];
    const gx = x + position.xOffset;
    const gy = position.yOffset;
    const path = glyph.path.toSVG();
    if (path) {
      left = Math.min(left, gx + glyph.bbox.minX);
      right = Math.max(right, gx + glyph.bbox.maxX);
      top = Math.max(top, gy + glyph.bbox.maxY);
      bottom = Math.min(bottom, gy + glyph.bbox.minY);
      glyphs.push(`<path d="${path}" transform="translate(${gx} ${-gy}) scale(1 -1)"/>`);
    }
    x += position.xAdvance + (tracking * font.unitsPerEm) / 1000;
  }
  if (!glyphs.length) return wordArtwork('Brand', id, 0);
  const height = top - bottom;
  return {
    art: `<g transform="scale(${48 / height}) translate(${-left} ${top})">${glyphs.join('')}</g>`,
    width: (48 * (right - left)) / height,
  };
}

export function outlineText(value: string, id: BrandFont, x: number, y: number, capHeight: number, maxWidth: number, maxLines = 1) {
  const measure = (line: string) => wordArtwork(line, id, 0);
  const words = value.trim().split(/\s+/);
  let scale = capHeight / 48;
  let lines: string[];
  for (;;) {
    lines = [];
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && measure(next).width * scale > maxWidth) {
        lines.push(current);
        current = word;
      } else current = next;
    }
    if (current) lines.push(current);
    if (lines.length <= maxLines || scale <= 0.4) break;
    scale *= 0.93;
  }
  return lines.slice(0, maxLines).map((line, index) => {
    const art = measure(line);
    return fit(art.art, x, y + 63 * scale * index, Math.min(scale, maxWidth / art.width));
  }).join('');
}

function shapeElement(part: Shape) {
  switch (part.shape) {
    case 'rect': return `<rect x="${part.x}" y="${part.y}" width="${part.w}" height="${part.h}" rx="${part.r ?? 0}"/>`;
    case 'circle': return `<circle cx="${part.cx}" cy="${part.cy}" r="${part.r}"/>`;
    case 'ring': {
      const inner = part.r - part.width;
      if (inner <= 0) return `<circle cx="${part.cx}" cy="${part.cy}" r="${part.r}"/>`;
      const arc = (r: number) => `M${part.cx - r} ${part.cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
      return `<path fill-rule="evenodd" d="${arc(part.r)}${arc(inner)}"/>`;
    }
    case 'polygon': return `<polygon points="${part.points.map((point) => point.join(',')).join(' ')}"/>`;
  }
}

function drawGrid(parts: Shape[], base = '') {
  let art = base;
  let defs = '';
  for (const [index, part] of parts.entries()) {
    const rendered = shapeElement(part);
    if (part.op === 'cut') {
      defs += `<mask id="cut-${index}" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><rect width="48" height="48" fill="white"/><g fill="black">${rendered}</g></mask>`;
      art = `<g mask="url(#cut-${index})">${art}</g>`;
    } else {
      art += rendered;
    }
  }
  return { art, defs };
}

function traceArtwork(reference: string) {
  // Convert each horizontal run to a closed path on the 48-unit grid.
  let path = '';
  for (let y = 0; y < 32; y += 1) {
    let x = 0;
    while (x < 32) {
      if (reference[y * 32 + x] !== '1') {
        x += 1;
        continue;
      }
      const start = x;
      while (x < 32 && reference[y * 32 + x] === '1') x += 1;
      path += `M${start * 1.5} ${y * 1.5}h${(x - start) * 1.5}v1.5h${(start - x) * 1.5}z`;
    }
  }
  return `<path d="${path}"/>`;
}

export function artboard(width: number, height: number, body: string, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}" viewBox="0 0 ${round(width)} ${round(height)}">${defs ? `<defs>${defs}</defs>` : ''}<g fill="currentColor">${body}</g></svg>`;
}

export function raster(svg: string, width: number) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } }).render();
}

const fit = (art: string, x: number, y: number, scale: number) =>
  `<g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})">${art}</g>`;

function makeLogo(recipe: DirectionRecipe, name: string, supplied: string[], references: ReturnType<typeof prepareReferenceSet>): LogoDirection {
  const text = wordArtwork(name, recipe.font, recipe.tracking);
  const initial = name.match(/[\p{L}\p{N}]/u)?.[0] ?? Array.from(name)[0];
  const letter = wordArtwork(initial, recipe.font, 0);
  const scale = Math.min(35 / letter.width, 35 / 48);
  const glyph = fit(letter.art, (48 - letter.width * scale) / 2, (48 - 48 * scale) / 2, scale);
  const isType = recipe.kind === 'letter' || recipe.kind === 'wordmark';
  const reference = recipe.reference === undefined ? undefined : supplied[recipe.reference - 1];
  const drawn = drawGrid(recipe.mark, recipe.kind === 'trace' && reference ? traceArtwork(reference) : '');
  const { art, defs } = isType ? { art: glyph, defs: '' } : drawn;
  const mark = artboard(48, 48, art, defs);
  const wordmark = artboard(text.width + 8, 56, fit(text.art, 4, 4, 1));

  const markWidth = 48;
  const gap = 13;
  const wordScale = Math.min(0.72, 252 / text.width);
  const wordWidth = text.width * wordScale;
  const y = (48 - 48 * wordScale) / 2;
  const stackedWidth = Math.max(markWidth, wordWidth) + 12;
  const combined = recipe.kind === 'wordmark' ? wordmark :
    artboard(markWidth + gap + wordWidth + 12, 60, fit(art, 6, 6, 1) + fit(text.art, markWidth + gap + 6, y + 6, wordScale), defs);
  const stacked = recipe.kind === 'wordmark' ? wordmark :
    artboard(stackedWidth, 73 + 48 * wordScale, fit(art, (stackedWidth - markWidth) / 2, 6, 1) + fit(text.art, (stackedWidth - wordWidth) / 2, 66, wordScale), defs);
  const render = (size: number) => raster(recolor(mark, '#000000'), size).pixels;
  const checks = inspect(render(192), render(16));
  const nearest = references.length ? Math.max(...silhouettes(references, render(96)).map(similarity)) : null;
  return {
    ...recipe, markSvg: mark, wordmarkSvg: wordmark, lockupSvg: combined, stackedSvg: stacked,
    checks: { ...checks, nearest, referenceCount: references.length },
  };
}

export function buildLogos(project: BrandProject, {
  research = [], alternateMarks = [], revise = true,
}: { research?: string[]; alternateMarks?: Shape[][]; revise?: boolean } = {}): LogoDirection[] {
  const { brief, draft } = project;
  const supplied = brief.references;
  const compareAgainst = prepareReferenceSet([...supplied, ...research].filter((ref) => ref.includes('1') && ref.includes('0')));
  const defaults = starterDirections(brief);
  const silhouettesUsed: Uint8Array[] = [];
  const distinct = new Set<string>();
  const isPicture = (logo: LogoDirection) => logo.kind === 'symbol' || logo.kind === 'trace';
  const canonicalMark = (logo: LogoDirection) => normalizedSilhouette(raster(recolor(logo.markSvg, '#000000'), 96).pixels);

  return draft.directions.map((recipe, index) => {
    const defaultRecipe = defaults[index];
    const { ink, paper, accent } = recipe.palette;
    const palette = contrast(ink.hex, paper.hex) >= 4.5 &&
      Math.max(contrast(accent.hex, ink.hex), contrast(accent.hex, paper.hex)) >= 3 ? recipe.palette : starterPalette(index);
    const make = (design: DirectionRecipe) => makeLogo({ ...design, palette }, brief.businessName, supplied, compareAgainst);
    const reference = recipe.reference === undefined ? undefined : supplied[recipe.reference - 1];
    const allowTrace = recipe.kind === 'trace' && brief.remixReferences && reference?.includes('1') &&
      reference.includes('0') && recipe.mark.length > 0;

    let logo = make(recipe.kind === 'trace' && !allowTrace ? defaultRecipe : recipe);
    const different = (direction: LogoDirection) => {
      if (distinct.has(direction.markSvg)) return false;
      if (!isPicture(direction)) return true;
      const mark = canonicalMark(direction);
      return silhouettesUsed.every((ink) => silhouetteOverlap(mark, ink) < 0.86);
    };
    const usable = (direction: LogoDirection) => direction.checks.faviconReady &&
      (direction.checks.nearest ?? 0) < similarityLimit && different(direction);
    const changedTrace = allowTrace && (logo.checks.nearest ?? 1) < 0.985 && different(logo);

    if (revise && !changedTrace && !usable(logo)) {
      const alternative = alternateMarks[index];
      const candidate = isPicture(logo) && alternative?.length
        ? make({ ...recipe, kind: 'symbol', reference: undefined, mark: alternative })
        : undefined;
      if (candidate && usable(candidate)) {
        logo = candidate;
      } else {
        const backups = [defaultRecipe, ...defaults].map(make);
        logo = backups.find(usable) ?? backups.find((item) => item.checks.faviconReady && different(item)) ?? backups[0];
      }
    }
    distinct.add(logo.markSvg);
    if (revise && isPicture(logo)) silhouettesUsed.push(canonicalMark(logo));
    return logo;
  });
}
