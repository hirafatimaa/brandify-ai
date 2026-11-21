import sharp from 'sharp';

const generalChannels = ['logotype-logomark', 'marks-monograms-symbols', 'design-logomark-wordmark-symbol', 'gd-logos-marks-symbols'];
const industries: Record<string, string> = {
  Technology: 'technology', Fashion: 'fashion', 'Food & Beverage': 'food and drink', 'Health & Wellness': 'wellness',
  Finance: 'finance', Education: 'education', Entertainment: 'entertainment', 'Real Estate': 'architecture',
  'E-commerce': 'retail', Travel: 'travel', Automotive: 'automotive',
};
const headers = { 'User-Agent': 'Brandify logo research' };
const catalogs = new Map<string, { expires: number; request: Promise<string[]> }>();

async function getJson(path: string, signal: AbortSignal) {
  const response = await fetch(`https://api.are.na/v3/${path}`, { headers, signal, redirect: 'error' });
  return response.ok ? response.json() : null;
}

async function channelsFor(query: string, signal: AbortSignal) {
  const search = new URLSearchParams({ query: `${query} visual identity logos`, type: 'Channel', per: '12' });
  const response = await getJson(`search?${search}`, signal);
  return Array.isArray(response?.data) ? response.data
    .filter((channel: { slug?: string; visibility?: string }) => channel.visibility !== 'private' && /^[a-z0-9-]{1,120}$/.test(channel.slug ?? ''))
    .sort((a: { counts?: { contents?: number } }, b: { counts?: { contents?: number } }) => (b.counts?.contents ?? 0) - (a.counts?.contents ?? 0))
    .slice(0, 2)
    .map((channel: { slug: string }) => channel.slug) : [];
}

async function measure(url: string, signal: AbortSignal) {
  const address = new URL(url);
  if (address.protocol !== 'https:' || address.hostname !== 'images.are.na' || address.port) return null;
  const response = await fetch(address, { headers, signal, redirect: 'error' });
  if (!response.ok || Number(response.headers.get('content-length')) > 1_500_000) return null;
  const data = await response.arrayBuffer();
  if (data.byteLength > 1_500_000) return null;
  const { data: pixels, info: { width, height } } = await sharp(Buffer.from(data), { limitInputPixels: 2_000_000 })
    .rotate().resize(30, 30, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const offset = (x: number, y: number) => (y * width + x) * 4;
  const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]].map(([x, y]) => offset(x, y));
  const luma = (i: number) => 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
  const levels = corners.map(luma).sort((a, b) => a - b);
  const transparent = corners.filter((i) => pixels[i + 3] < 64).length >= 3;
  if (!transparent && levels[3] - levels[0] > 42) return null;

  const background = (levels[1] + levels[2]) / 2;
  const square = Array<string>(1024).fill('0');
  let area = 0;
  let ambiguous = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = offset(x, y);
      const delta = Math.abs(luma(i) - background);
      if (!transparent && delta > 25 && delta < 65) ambiguous += 1;
      if (pixels[i + 3] < 128 || (!transparent && delta < 65)) continue;
      square[(y + Math.floor((32 - height) / 2)) * 32 + x + Math.floor((32 - width) / 2)] = '1';
      area += 1;
    }
  }
  const share = area / (width * height);
  // Full-bleed art and photographs are poor comparison marks.
  if (share < 0.05 || share > 0.62 || ambiguous / (width * height) > 0.16) return null;
  return square.join('');
}

async function pull(channels: string[], limit: number, signal: AbortSignal) {
  const lists = await Promise.all(channels.map(async (channel): Promise<string[]> => {
    const payload = await getJson(`channels/${channel}/contents?per=${limit}&page=1`, signal).catch(() => null);
    if (!Array.isArray(payload?.data)) return [];
    return payload.data.flatMap((item: { type?: string; image?: { small?: { src?: string } } }) =>
      item.type === 'Image' && item.image?.small?.src ? [item.image.small.src] : []);
  }));
  const images = [...new Set(lists.flat())];
  const results: string[] = [];
  for (let offset = 0; offset < images.length && !signal.aborted; offset += 12) {
    const masks = await Promise.all(images.slice(offset, offset + 12).map((url) => measure(url, signal).catch(() => null)));
    results.push(...masks.filter((mask): mask is string => mask !== null));
  }
  return [...new Set(results)];
}

function cached(key: string, get: () => Promise<string[]>) {
  const existing = catalogs.get(key);
  if (existing && existing.expires > Date.now()) return existing.request;
  const record = { expires: Date.now() + 3_600_000, request: Promise.resolve([] as string[]) };
  record.request = get().catch(() => []).then((references) => {
    if (!references.length) record.expires = Date.now() + 60_000;
    return references;
  });
  catalogs.set(key, record);
  return record.request;
}

export async function researchReferences(industry: string) {
  const query = industries[industry];
  const general = cached('general', () => pull(generalChannels, 25, AbortSignal.timeout(6500)));
  const specific = query ? cached(query, async () => {
    const signal = AbortSignal.timeout(6500);
    const channels = await channelsFor(query, signal);
    return pull(channels, 10, signal);
  }) : Promise.resolve([]);
  const [broad, related] = await Promise.all([general, specific]);
  return [...new Set([...broad, ...related])];
}
