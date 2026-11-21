// Based on make-logo's silhouette, edge distance and perceptual hash checks.
// https://github.com/arla6ka/design.how/tree/main/skills/make-logo

function mask(pixels: Uint8Array) {
  return Uint8Array.from({ length: pixels.length / 4 }, (_, i) => Number(pixels[i * 4 + 3] >= 128));
}

function distanceTo(points: Uint8Array, side: number) {
  // The two passes compute chamfer distance. Diagonal steps cost sqrt(2).
  const distances = Float32Array.from(points, (point) => (point ? 0 : side * 2));
  for (const step of [1, -1]) {
    for (let k = 0; k < distances.length; k += 1) {
      const i = step === 1 ? k : distances.length - 1 - k;
      const x = i % side;
      const row = i - side * step;
      if (x - step >= 0 && x - step < side) distances[i] = Math.min(distances[i], distances[i - step] + 1);
      if (row < 0 || row >= distances.length) continue;
      distances[i] = Math.min(distances[i], distances[row] + 1);
      if (x > 0) distances[i] = Math.min(distances[i], distances[row - 1] + Math.SQRT2);
      if (x < side - 1) distances[i] = Math.min(distances[i], distances[row + 1] + Math.SQRT2);
    }
  }
  return distances;
}

function holes(ink: Uint8Array, side: number) {
  const visited = new Uint8Array(ink.length);
  let count = 0;
  for (let index = 0; index < ink.length; index += 1) {
    if (ink[index] || visited[index]) continue;
    visited[index] = 1;
    const queue = [index];
    let border = false;
    for (let i = 0; i < queue.length; i += 1) {
      const p = queue[i];
      const x = p % side;
      if (x === 0 || x === side - 1 || p < side || p >= ink.length - side) border = true;
      const neighbors = [x > 0 ? p - 1 : -1, x < side - 1 ? p + 1 : -1, p - side, p + side];
      for (const next of neighbors) {
        if (next >= 0 && next < ink.length && !ink[next] && !visited[next]) {
          visited[next] = 1;
          queue.push(next);
        }
      }
    }
    if (!border && queue.length >= ink.length * 0.004) count += 1;
  }
  return count;
}

export function inspect(large: Uint8Array, small: Uint8Array) {
  const ink = mask(large);
  const side = Math.sqrt(ink.length);
  const distances = distanceTo(ink.map((bit) => 1 - bit), side);
  const widths = Array.from(distances).filter((value, i) => ink[i] && value > 0 &&
    [i - 1, i + 1, i - side, i + side].every((next) => value >= (distances[next] ?? 0)));
  widths.sort((a, b) => a - b);
  const stroke = Math.round((widths[Math.floor(widths.length / 2)] ?? 0) * 3200 / side) / 100;
  const counters: [number, number] = [holes(mask(small), 16), holes(ink, side)];
  const coverage = ink.reduce((sum, bit) => sum + bit, 0) / ink.length;
  return { stroke, counters, faviconReady: stroke >= 1.5 && counters[0] === counters[1] && coverage >= 0.07 && coverage <= 0.9 };
}

const side = 32;
const cosine = Array.from({ length: 8 }, (_, freq) =>
  Array.from({ length: side }, (_, point) => Math.cos((Math.PI * freq * (point + 0.5)) / side)));

function canonical(source: Uint8Array, width: number, flip = false, degrees = 0) {
  const angle = degrees * Math.PI / 180;
  const rotated = new Uint8Array(source.length);
  const center = (width - 1) / 2;
  let minX = width;
  let minY = width;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - center;
      const dy = y - center;
      let sx = Math.round(Math.cos(angle) * dx - Math.sin(angle) * dy + center);
      const sy = Math.round(Math.sin(angle) * dx + Math.cos(angle) * dy + center);
      if (flip) sx = width - 1 - sx;
      if (sx < 0 || sx >= width || sy < 0 || sy >= width || !source[sy * width + sx]) continue;
      rotated[y * width + x] = 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  const span = Math.max(maxX - minX + 1, maxY - minY + 1);
  if (span < 1) return new Uint8Array(side * side);
  return Uint8Array.from({ length: side * side }, (_, i) => {
    const x = Math.round((i % side - 15.5) * span / 28 + (maxX + minX) / 2);
    const y = Math.round((Math.floor(i / side) - 15.5) * span / 28 + (maxY + minY) / 2);
    return x >= 0 && x < width && y >= 0 && y < width ? rotated[y * width + x] : 0;
  });
}

export function normalizedSilhouette(pixels: Uint8Array) {
  const ink = mask(pixels);
  return canonical(ink, Math.sqrt(ink.length));
}

export function silhouetteOverlap(first: Uint8Array, second: Uint8Array) {
  const intersection = first.reduce((sum, bit, index) => sum + (bit & second[index]), 0);
  const union = first.reduce((sum, bit, index) => sum + (bit | second[index]), 0);
  return union ? intersection / union : 0;
}

function features(ink: Uint8Array) {
  const edge: number[] = [];
  for (const [index, bit] of ink.entries()) {
    if (bit && [index - 1, index + 1, index - side, index + side].some((next) => !ink[next])) edge.push(index);
  }
  const dct = cosine.flatMap((row) => cosine.map((col) =>
    ink.reduce((sum, value, index) => sum + value * row[Math.floor(index / side)] * col[index % side], 0)));
  dct.shift();
  const median = [...dct].sort((a, b) => a - b)[31];
  const hash = dct.map((value) => value > median);
  const edgeMap = new Uint8Array(ink.length);
  for (const index of edge) edgeMap[index] = 1;
  return { ink, edge, hash, distances: distanceTo(edgeMap, side) };
}

export function prepareReferenceSet(references: string[]) {
  return references.map((reference) => features(canonical(Uint8Array.from(reference, Number), side)));
}

export function silhouettes(references: ReturnType<typeof prepareReferenceSet>, pixels: Uint8Array) {
  const candidate = mask(pixels);
  const poses = [false, true].flatMap((flip) => [-6, -3, 0, 3, 6].map((turn) =>
    features(canonical(candidate, Math.sqrt(candidate.length), flip, turn))));
  return references.map((reference) => ({ poses, reference }));
}

export function similarity({ poses, reference }: ReturnType<typeof silhouettes>[number]) {
  let strongest = -1;
  let score = 0;
  for (const pose of poses) {
    if (!pose.edge.length || !reference.edge.length) continue;
    const overlap = silhouetteOverlap(pose.ink, reference.ink);
    const mean = (indexes: number[], distances: Float32Array) => indexes.reduce((sum, i) => sum + distances[i], 0) / indexes.length;
    const edges = (mean(pose.edge, reference.distances) + mean(reference.edge, pose.distances)) * 500 / side;
    const hash = pose.hash.filter((value, index) => value === reference.hash[index]).length / pose.hash.length;
    const strength = Math.max(overlap, 1 - edges / 60, (hash - 0.5) * 1.8);
    if (strength > strongest) {
      strongest = strength;
      score = 1 / (1 + Math.exp(-(8.0572 * overlap - 9.1729 * edges / 100 + 6.3101 * hash - 4.8029)));
    }
  }
  return Math.round(score * 10000) / 10000;
}
