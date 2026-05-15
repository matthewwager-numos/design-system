import { mulberry32 } from "./random";

export interface BlobOptions {
  /** Number of control points around the circumference. More = more detail. */
  points?: number;
  /** Amount of organic wobble, 0–1. 0 = perfect circle, 1 = wildly deformed. */
  randomness?: number;
  /** Base radius (viewBox is `0 0 2*radius 2*radius`). */
  radius?: number;
  /** Random seed for reproducibility. */
  seed?: number;
}

export interface BlobResult {
  /** SVG `d` attribute value. Drop straight into `<path d={...} />`. */
  d: string;
  /** Suggested viewBox to wrap the blob. */
  viewBox: string;
  /** The seed actually used (handy if you let one be auto-generated). */
  seed: number;
}

/**
 * Generate a smooth, organic blob shape.
 *
 *   const { d, viewBox } = blob({ points: 6, randomness: 0.35, seed: 42 });
 *   // <svg viewBox={viewBox}><path d={d} fill="var(--color-primary)" /></svg>
 */
export function blob(options: BlobOptions = {}): BlobResult {
  const points = Math.max(3, options.points ?? 6);
  const randomness = clamp(options.randomness ?? 0.35, 0, 1);
  const radius = options.radius ?? 100;
  const seed = options.seed ?? Math.floor(Math.random() * 0xffffffff);

  const rand = mulberry32(seed);
  const cx = radius;
  const cy = radius;

  // Sample N points around a circle, jittering each radius.
  const samples: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const jitter = 1 - randomness + rand() * randomness * 2;
    const r = radius * jitter * 0.85;
    samples.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }

  // Build a closed Catmull-Rom spline → cubic Bezier path for smoothness.
  const d = catmullRomToBezier(samples);

  return {
    d,
    viewBox: `0 0 ${2 * radius} ${2 * radius}`,
    seed,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function catmullRomToBezier(pts: Array<{ x: number; y: number }>): string {
  const n = pts.length;
  if (n < 2) return "";
  const get = (i: number) => pts[((i % n) + n) % n]!;

  let d = `M ${get(0).x.toFixed(2)} ${get(0).y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d + " Z";
}
