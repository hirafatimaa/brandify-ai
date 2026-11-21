import { PDFDocument, rgb as pdfColor, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { strToU8, zipSync } from 'fflate';
import { artboard, fontAsset, outlineText, raster } from './artwork';
import { colorKeys, contrastPairs, filename, fonts, proportions, readableOn, recolor, rgb, cmyk, type BrandProject, type LogoDirection } from './model';

const width = 960;
const height = 540;
const margin = 39;
const lineColor = '#D8D7CE';
const dark = '#171916';
const muted = '#53564D';
const paper = '#F8F7F2';

function color(hex: string) {
  const [r, g, b] = rgb(hex);
  return pdfColor(r / 255, g / 255, b / 255);
}

function rect(page: PDFPage, x: number, y: number, w: number, h: number, fill: string) {
  page.drawRectangle({ x, y: height - y - h, width: w, height: h, color: color(fill) });
}

function rule(page: PDFPage, x: number, y: number, end: number, fill = lineColor) {
  page.drawLine({ start: { x, y: height - y }, end: { x: end, y: height - y }, color: color(fill), thickness: 0.55 });
}

function safeText(font: PDFFont, value: string) {
  const charset = new Set(font.getCharacterSet());
  const replacements: Record<string, string> = { '—': '-', '–': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '…': '...', '\u00a0': ' ', '\n': ' ' };
  return Array.from(value).map((letter) => charset.has(letter.codePointAt(0)!) ? letter :
    replacements[letter] ?? (charset.has(0x25a0) ? '■' : '?')).join('');
}

function wrap(font: PDFFont, value: string, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of safeText(font, value).split(/\s+/)) {
    const combined = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(combined, size) <= maxWidth) {
      line = combined;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    for (const letter of word) {
      if (line && font.widthOfTextAtSize(line + letter, size) > maxWidth) {
        lines.push(line);
        line = '';
      }
      line += letter;
    }
  }
  return line ? [...lines, line] : lines;
}

function text(page: PDFPage, font: PDFFont, value: string, x: number, y: number, size: number, options: {
  width?: number; color?: string; lineHeight?: number; maxLines?: number;
} = {}) {
  const { width: maxWidth = width - margin - x, color: fill = dark, lineHeight = size * 1.28, maxLines } = options;
  let lines = wrap(font, value, size, maxWidth);
  if (maxLines && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (last && font.widthOfTextAtSize(last + '...', size) > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = last + '...';
  }
  lines.forEach((line, index) => page.drawText(line, { x, y: height - y - size - lineHeight * index, size, font, color: color(fill) }));
  return y + lines.length * lineHeight;
}

async function logoArt(document: PDFDocument, page: PDFPage, svg: string, colorHex: string, x: number, y: number, w: number, h: number) {
  const working = raster(recolor(svg, colorHex), Math.round(w * 2.6));
  const image = await document.embedPng(working.asPng());
  const scaled = image.scaleToFit(w, h);
  page.drawImage(image, { ...scaled, x: x + (w - scaled.width) / 2, y: height - y - (h + scaled.height) / 2 });
}

export async function guidelinesPdf(project: BrandProject, logos: LogoDirection[], active: number, book = false) {
  const { brief, draft } = project;
  const logo = logos[active];
  const { palette } = logo;
  const brandInk = palette.ink.hex;
  const brandPaper = palette.paper.hex;
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  document.setTitle(`${brief.businessName} | ${book ? 'Logo directions' : 'Brand guidelines'}`);
  document.setAuthor('Brandify');
  const body = await document.embedFont(fontAsset('manrope'), { subset: true });
  const display = logo.font === 'manrope' ? body : await document.embedFont(fontAsset(logo.font), { subset: true });
  const footer = (page: PDFPage, title: string) => {
    rule(page, margin, 501, width - margin);
    text(page, body, brief.businessName, margin, 510, 9, { color: muted, width: 415, maxLines: 1 });
    text(page, body, title, 500, 510, 9, { color: muted, maxLines: 1 });
    text(page, body, String(document.getPageCount()).padStart(2, '0'), 897, 510, 9, { color: muted });
  };
  const add = (title: string, label = title) => {
    const page = document.addPage([width, height]);
    rect(page, 0, 0, width, height, paper);
    text(page, body, label.toUpperCase(), margin, 28, 9, { color: muted });
    text(page, body, title, margin, 43, 28);
    rule(page, margin, 91, width - margin);
    footer(page, label);
    return page;
  };
  const cover = document.addPage([width, height]);
  rect(cover, 0, 0, width, height, brandInk);
  rect(cover, 0, 0, 12, height, palette.accent.hex);
  await logoArt(document, cover, logo.lockupSvg, brandPaper, 40, 38, 186, 49);
  await logoArt(document, cover, logo.markSvg, palette.accent.hex, 659, 188, 214, 214);
  text(cover, display, book ? 'Logo' : 'Brand', margin, 204, 95, { color: brandPaper, width: 600 });
  text(cover, display, book ? 'directions' : 'guidelines', margin, 296, 95, { color: brandPaper, width: 602 });
  rule(cover, margin, 473, width - margin, brandPaper);
  text(cover, body, draft.tagline, margin, 489, 14, { color: brandPaper, width: 760, maxLines: 1 });

  if (book) {
    for (const [index, study] of logos.entries()) {
      const page = add(study.title, `Direction ${String(index + 1).padStart(2, '0')}`);
      const colors = study.palette;
      rect(page, margin, 109, 544, 294, colors.ink.hex);
      await logoArt(document, page, study.lockupSvg, colors.paper.hex, 94, 174, 435, 154);
      rect(page, 590, 109, 331, 133, colors.accent.hex);
      await logoArt(document, page, study.markSvg, readableOn(colors.accent.hex), 717, 131, 79, 79);
      text(page, body, study.idea, 590, 261, 15, { width: 320 });
      text(page, body, fonts[study.font].name, 590, 339, 11, { color: muted });
      text(page, body, study.kind === 'trace' ? `Adapted from moodboard reference ${study.reference}.` : 'Original construction', 590, 358, 11, { color: muted });
      text(page, body, study.checks.faviconReady ? '16 px symbol check passed.' : 'Use a simplified mark at favicon size.', 590, 377, 11, { color: muted });
      colorKeys.forEach((key, i) => rect(page, margin + 108.8 * i, 416, 108.8, 53, colors[key].hex));
      for (const [proof, size] of [16, 32, 64].entries()) {
        await logoArt(document, page, study.markSvg, colors.ink.hex, 625 + proof * 103 - size / 2, 438 - size / 2, size, size);
        text(page, body, `${size} px`, 611 + proof * 103, 474, 9, { color: muted });
      }
    }
    return document.save();
  }

  let page = add('The brand', 'Foundation');
  rect(page, margin, 109, 882, 235, brandInk);
  await logoArt(document, page, logo.lockupSvg, brandPaper, 244, 164, 472, 125);
  text(page, body, 'Introduction', margin, 371, 19, { width: 165 });
  text(page, body, draft.introduction, 221, 372, 12, { width: 351 });
  text(page, body, 'Positioning', 606, 371, 12);
  text(page, body, draft.positioning, 606, 395, 11, { width: 308, color: muted });

  page = add('Signature and symbol', 'Marks');
  const swatches = [[brandPaper, brandInk], [brandInk, brandPaper], [palette.accent.hex, readableOn(palette.accent.hex)]];
  for (const [index, [background, fg]] of swatches.entries()) {
    const x = margin + 298 * index;
    rect(page, x, 111, 286, 158, background);
    await logoArt(document, page, index === 2 ? logo.markSvg : logo.lockupSvg, fg, x + 32, 137, 222, 104);
    text(page, body, ['Primary signature', 'Reversed signature', 'Standalone symbol'][index], x, 281, 11);
  }
  text(page, body, logo.idea, margin, 322, 18, { width: 530 });
  text(page, body, 'Keep at least half a symbol height clear on all sides. Use the supplied signature at 128 px wide or larger. Switch to the symbol in compact spaces and proof small print at actual size.', margin, 386, 12, { width: 514 });
  text(page, body, '16 / 32 / 64 px', 650, 325, 10, { color: muted });
  for (const [index, size] of [16, 32, 64].entries()) {
    await logoArt(document, page, logo.markSvg, brandInk, 653 + index * 76, 365, size, size);
  }
  text(page, body, logo.kind === 'trace' ? `Adapted from moodboard reference ${logo.reference}. ${logo.checks.faviconReady ? 'Small-size check passed.' : 'Use a simplified favicon.'}` :
    logo.checks.faviconReady ? 'Use the standalone symbol at browser sizes.' : 'Use a simplified symbol at browser sizes.', 650, 438, 10, { width: 268, color: muted });

  page = add('Core palette', 'Color');
  let swatchX = margin;
  for (const key of colorKeys) {
    const entry = palette[key];
    const w = 882 * proportions[key] / 100;
    rect(page, swatchX, 112, w, 42, entry.hex);
    swatchX += w;
  }
  colorKeys.forEach((key, index) => {
    const entry = palette[key];
    const x = margin + index * 177;
    rect(page, x, 173, 166, 112, entry.hex);
    text(page, body, entry.name, x, 296, 12, { width: 166, maxLines: 1 });
    text(page, body, `${entry.hex.toUpperCase()}   /   ${proportions[key]}%`, x, 319, 10, { color: muted });
    text(page, body, `RGB   ${rgb(entry.hex).join(', ')}`, x, 337, 10, { color: muted });
    text(page, body, `CMYK  ${cmyk(entry.hex).join(', ')}`, x, 354, 10, { color: muted });
    text(page, body, entry.use, x, 380, 10, { width: 161 });
  });
  text(page, body, 'CMYK values are estimates. Confirm the profile and output with your printer.', margin, 468, 9, { color: muted });

  page = add('Readable combinations', 'Color contrast');
  for (const [index, entry] of contrastPairs(palette).entries()) {
    const x = margin + (index % 3) * 298;
    const y = 111 + Math.floor(index / 3) * 155;
    rect(page, x, y, 286, 105, entry.bg.hex);
    text(page, body, 'Aa', x + 19, y + 6, 61, { color: entry.fg.hex });
    text(page, body, `${entry.fg.name} on ${entry.bg.name}`, x, y + 111, 10, { width: 180, maxLines: 1 });
    text(page, body, `${entry.ratio.toFixed(2)}:1  ${entry.ratio >= 7 ? 'AAA' : entry.ratio >= 4.5 ? 'AA' : 'Below AA'}`, x + 206, y + 111, 9, { width: 80 });
  }
  text(page, body, 'Use pairs rated AA or above for normal text. Check contrast again if you place the type over a photo.', margin, 455, 11, { color: muted });

  page = add('Typography', 'Type system');
  text(page, body, `${fonts[logo.font].name} / ${fonts[logo.font].weight}`, margin, 113, 11, { color: muted });
  text(page, display, draft.voice.headline, margin, 138, 61, { width: 800, maxLines: 2, lineHeight: 65 });
  rule(page, margin, 295, width - margin);
  text(page, body, 'Manrope / 400', margin, 321, 11, { color: muted });
  text(page, body, draft.typography, margin, 346, 17, { width: 530 });
  text(page, body, 'Display  64 / 1.05\nHeading  40 / 1.1', margin, 438, 12, { width: 300, color: muted });
  text(page, body, 'Body  16 / 1.55     Caption  12 / 1.5', 493, 438, 12, { color: muted });

  page = add('How the brand sounds', 'Voice');
  text(page, display, draft.voice.headline, margin, 111, 43, { width: 840, maxLines: 2 });
  text(page, body, draft.voice.summary, margin, 231, 13, { width: 660 });
  rule(page, margin, 308, width - margin);
  draft.voice.principles.forEach((principle, index) => {
    const x = margin + index * 298;
    text(page, body, principle.title, x, 324, 16, { width: 267, maxLines: 2 });
    text(page, body, principle.guidance, x, 373, 11, { width: 255 });
    text(page, body, principle.example, x, 444, 11, { width: 255, color: muted, maxLines: 2 });
  });

  page = add('Brand in use', 'Applications');
  rect(page, margin, 113, 541, 285, brandInk);
  await logoArt(document, page, logo.lockupSvg, brandPaper, 63, 136, 138, 39);
  const posterSize = [44, 40, 36, 32, 28, 24].find((size) => wrap(display, draft.voice.headline, size, 472).length <= 2) ?? 22;
  text(page, display, draft.voice.headline, 63, 209, posterSize, { width: 472, color: brandPaper });
  text(page, body, draft.voice.action, 63, 355, 12, { color: brandPaper });
  rect(page, 595, 113, 326, 285, palette.accent.hex);
  await logoArt(document, page, logo.markSvg, readableOn(palette.accent.hex), 665, 161, 188, 188);
  text(page, body, draft.applications.poster, margin, 414, 11, { width: 522 });
  text(page, body, draft.applications.social, 595, 414, 11, { width: 326 });

  page = add('Files and handoff', 'Export');
  const handoff = [
    ['SVG', 'Use the outlined vectors for print, large layouts or design tools.'],
    ['PNG', 'Use transparent artwork for everyday documents and social content.'],
    ['ICO', 'Use the multi-size favicon in browser tabs, alongside the supplied app PNGs.'],
    ['Design tokens', 'Use the CSS and JSON palette and type values when implementing the identity.'],
    ['Licenses and trademark', 'Review the font notices and use the trademark search sheet before adopting the direction.'],
  ];
  handoff.forEach(([title, description], index) => {
    const y = 111 + index * 68;
    text(page, body, title, margin, y, 15, { width: 260 });
    text(page, body, description, 311, y, 12, { width: 608 });
    rule(page, margin, y + 51, width - margin);
  });
  return document.save();
}

function artworkContents(svg: string) {
  return {
    body: svg.match(/<g fill="currentColor">([\s\S]*)<\/g><\/svg>$/)?.[1] ?? '',
    defs: svg.match(/<defs>([\s\S]*?)<\/defs>/)?.[1] ?? '',
  };
}

export function faviconPng(logo: LogoDirection, size: number, profile = false) {
  const { ink, accent } = logo.palette;
  const { body, defs } = artworkContents(logo.markSvg);
  const field = profile ? `<rect width="60" height="60" fill="${accent.hex}"/>` : '';
  const picture = profile && size > 512 ? '<g transform="translate(10.8 10.8) scale(0.8)">' : '<g transform="translate(6 6)">';
  return raster(recolor(artboard(60, 60, `${field}${picture}${body}</g>`, defs), profile ? readableOn(accent.hex) : ink.hex), size).asPng();
}

export function posterSvg(project: BrandProject, logo: LogoDirection) {
  const { headline, action } = project.draft.voice;
  const { ink, paper: light, accent } = logo.palette;
  const { body, defs } = artworkContents(logo.lockupSvg);
  const signatureWidth = Number(logo.lockupSvg.match(/width="([0-9.]+)"/)?.[1] ?? 200);
  const signatureScale = Math.min(260 / signatureWidth, 1.4);
  const art = [
    `<rect width="1200" height="780" fill="${ink.hex}"/>`,
    `<rect x="0" y="764" width="1200" height="16" fill="${accent.hex}"/>`,
    `<g transform="translate(55 56) scale(${signatureScale})">${body}</g>`,
    outlineText(headline, logo.font, 61, 338, 106, 1080, 3),
    outlineText(action, 'manrope', 61, 691, 28, 1050),
  ].join('');
  return recolor(artboard(1200, 780, art, defs), light.hex);
}

function ico(pngs: { size: number; data: Uint8Array }[]) {
  const header = 6 + pngs.length * 16;
  const result = new Uint8Array(header + pngs.reduce((sum, item) => sum + item.data.byteLength, 0));
  const view = new DataView(result.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, pngs.length, true);
  let offset = header;
  pngs.forEach(({ data, size }, index) => {
    const start = 6 + index * 16;
    result[start] = size;
    result[start + 1] = size;
    view.setUint16(start + 4, 1, true);
    view.setUint16(start + 6, 32, true);
    view.setUint32(start + 8, data.byteLength, true);
    view.setUint32(start + 12, offset, true);
    result.set(data, offset);
    offset += data.byteLength;
  });
  return result;
}

export function assetArchive(project: BrandProject, logo: LogoDirection) {
  const { brief, draft } = project;
  const { palette } = logo;
  const colors = { ink: palette.ink.hex, reverse: palette.paper.hex, accent: palette.accent.hex, black: '#000000' };
  const name = filename(brief.businessName);
  const parts = { mark: logo.markSvg, wordmark: logo.wordmarkSvg, signature: logo.lockupSvg, stacked: logo.stackedSvg };
  const files: Record<string, Uint8Array> = {};
  for (const [kind, svg] of Object.entries(parts)) {
    for (const [variant, fill] of Object.entries(colors)) {
      const artwork = recolor(svg, fill);
      files[`svg/${name}-${kind}-${variant}.svg`] = strToU8(artwork);
      files[`png/${name}-${kind}-${variant}.png`] = raster(artwork, kind === 'mark' ? 1024 : 1600).asPng();
    }
  }
  const icons = [16, 32, 48, 180, 192, 512, 1024].map((size) => ({ size, data: faviconPng(logo, size, true) }));
  for (const { size, data } of icons) files[`icons/icon-${size}.png`] = data;
  files['icons/favicon.ico'] = ico(icons.slice(0, 3));
  files[`social/${name}-avatar.png`] = faviconPng(logo, 1080, true);
  const poster = posterSvg(project, logo);
  files[`applications/${name}-campaign.svg`] = strToU8(poster);
  files[`applications/${name}-campaign.png`] = raster(poster, 2400).asPng();
  const typography = { display: fonts[logo.font].name, weight: fonts[logo.font].weight, body: 'Manrope', bodyWeight: 400 };
  files['brand.json'] = strToU8(JSON.stringify({ name: brief.businessName, tagline: draft.tagline, direction: logo.title, typography, palette, proportions, checks: logo.checks }, null, 2));
  files['tokens.css'] = strToU8(`:root {\n${colorKeys.map((key) => `  --brand-${key}: ${palette[key].hex};`).join('\n')}\n  --brand-display: "${typography.display}";\n  --brand-body: "${typography.body}";\n}\n`);
  files[`licenses/${fonts[logo.font].package}-OFL.txt`] = fontAsset(logo.font, true);
  files['licenses/manrope-OFL.txt'] = fontAsset('manrope', true);
  files['trademark-search.md'] = strToU8(`# Trademark search for ${brief.businessName}\n\nDirection: ${logo.title}\n\n${logo.kind === 'trace' ? `Adapted from supplied moodboard reference ${logo.reference}. Establish its provenance and confirm rights before adoption.\n\n` : ''}Search the name and similar spellings in the relevant product or service classes. Then search the mark's visual elements using the local design codes.\n\n- WIPO Global Brand Database: https://branddb.wipo.int/\n- USPTO trademark search: https://tmsearch.uspto.gov/\n- EUIPO: https://www.euipo.europa.eu/\n\nThe similarity check covered ${logo.checks.referenceCount} supplied references. It does not establish trademark clearance.\n`);
  return zipSync(files, { level: 3 });
}
