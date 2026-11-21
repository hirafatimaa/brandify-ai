const referenceSide = 32;

export async function readLogoReference(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5_000_000) {
    throw new Error('Use cropped PNG, JPEG or WebP files under 5 MB each.');
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = referenceSide;
  canvas.height = referenceSide;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) { bitmap.close(); throw new Error('This browser could not read the reference image.'); }
  const fit = 30 / Math.max(bitmap.width, bitmap.height);
  const width = bitmap.width * fit;
  const height = bitmap.height * fit;
  ctx.drawImage(bitmap, (referenceSide - width) / 2, (referenceSide - height) / 2, width, height);
  bitmap.close();

  const data = ctx.getImageData(0, 0, referenceSide, referenceSide).data;
  const brightness = (index: number) => 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
  const minX = Math.max(1, Math.ceil((referenceSide - width) / 2));
  const minY = Math.max(1, Math.ceil((referenceSide - height) / 2));
  const maxX = referenceSide - minX - 1;
  const maxY = referenceSide - minY - 1;
  const corners = [[minX, minY], [maxX, minY], [minX, maxY], [maxX, maxY]].map(([x, y]) => (y * referenceSide + x) * 4);
  const transparent = corners.filter((index) => data[index + 3] < 64).length >= 2;
  const background = corners.map(brightness).sort((a, b) => a - b).slice(1, 3).reduce((a, b) => (a + b) / 2);
  let coverage = 0;
  const mask = Array.from({ length: referenceSide ** 2 }, (_, i) => {
    const ink = data[i * 4 + 3] > 127 && (transparent || Math.abs(brightness(i * 4) - background) >= 65);
    if (ink) coverage += 1;
    return ink ? '1' : '0';
  }).join('');
  if (coverage < 25 || coverage > 850) throw new Error('Use a high-contrast crop of a single logo on a plain or transparent background.');
  return mask;
}
