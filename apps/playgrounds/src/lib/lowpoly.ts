export type PolygonType = "triangle" | "square" | "hexagon";

export interface LowPolyOptions {
  polygonType: PolygonType;
  size: number; // cell size in SVG units (hexagon: circumradius)
  jitter: number; // 0-1 — perturbs grid vertices (triangle/square) or color sample point (hexagon)
  seed: number;
  strokeColor: string;
  strokeWidth: number;
  background: string;
  transparent: boolean;
}

type Point = [number, number];
type Sample = [number, number, number, number]; // r,g,b,a

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

function centroid(points: Point[]): Point {
  let x = 0;
  let y = 0;
  for (const [px, py] of points) {
    x += px;
    y += py;
  }
  return [x / points.length, y / points.length];
}

function colorStr([r, g, b, a]: Sample): string {
  return a >= 250 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${(a / 255).toFixed(2)})`;
}

function polygonElement(points: Point[], fill: string, stroke: string, strokeWidth: number): string {
  const pts = points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(" ");
  const strokeAttr = strokeWidth > 0 ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : "";
  return `<polygon points="${pts}" fill="${fill}"${strokeAttr}/>`;
}

async function svgToImage(svgString: string): Promise<HTMLImageElement> {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load SVG — make sure it has valid dimensions"));
    img.src = url;
  });
  URL.revokeObjectURL(url);
  return img;
}

export async function polygonizeSvg(svgString: string, opts: LowPolyOptions): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.documentElement;
  if (svgEl.querySelector("parsererror")) throw new Error("Invalid SVG file");

  const vb = svgEl.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
  const W = vb?.[2] ?? Number(svgEl.getAttribute("width") || 400);
  const H = vb?.[3] ?? Number(svgEl.getAttribute("height") || 400);

  const img = await svgToImage(svgString);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  // Transparent (or near-transparent) pixels are outside the sphere — used to
  // silhouette the tessellation against the circle without hardcoding a shape.
  function sampleAt(px: number, py: number): Sample | null {
    const xi = Math.round(px);
    const yi = Math.round(py);
    if (xi < 0 || xi >= W || yi < 0 || yi >= H) return null;
    const i = (yi * W + xi) * 4;
    const a = data[i + 3]!;
    if (a < 10) return null;
    return [data[i]!, data[i + 1]!, data[i + 2]!, a];
  }

  const rng = mulberry32(opts.seed);
  const size = Math.max(4, opts.size);
  const jitterAmt = opts.jitter * size * 0.5;
  const parts: string[] = [];

  if (opts.polygonType === "hexagon") {
    const hexW = size * Math.sqrt(3);
    const hexH = size * 1.5;
    const cols = Math.ceil(W / hexW) + 2;
    const rows = Math.ceil(H / hexH) + 2;

    for (let r = -1; r <= rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const cx = c * hexW + (Math.abs(r) % 2 !== 0 ? hexW / 2 : 0);
        const cy = r * hexH;
        const sampleX = cx + (rng() - 0.5) * jitterAmt * 2;
        const sampleY = cy + (rng() - 0.5) * jitterAmt * 2;
        const sample = sampleAt(sampleX, sampleY);
        if (!sample) continue;

        const points: Point[] = Array.from({ length: 6 }, (_, k) => {
          const angle = (Math.PI / 180) * (60 * k - 90);
          return [cx + size * Math.cos(angle), cy + size * Math.sin(angle)] as Point;
        });
        parts.push(polygonElement(points, colorStr(sample), opts.strokeColor, opts.strokeWidth));
      }
    }
  } else {
    // Shared-vertex grid so quads/triangles stay seamless under jitter.
    const iMin = -1;
    const iMax = Math.ceil(W / size) + 1;
    const jMin = -1;
    const jMax = Math.ceil(H / size) + 1;

    const vertGrid: Point[][] = [];
    for (let j = jMin; j <= jMax; j++) {
      const row: Point[] = [];
      for (let i = iMin; i <= iMax; i++) {
        const jx = (rng() - 0.5) * jitterAmt * 2;
        const jy = (rng() - 0.5) * jitterAmt * 2;
        row.push([i * size + jx, j * size + jy]);
      }
      vertGrid.push(row);
    }
    const vertexAt = (i: number, j: number): Point => vertGrid[j - jMin]![i - iMin]!;

    for (let j = jMin; j < jMax; j++) {
      for (let i = iMin; i < iMax; i++) {
        const v00 = vertexAt(i, j);
        const v10 = vertexAt(i + 1, j);
        const v11 = vertexAt(i + 1, j + 1);
        const v01 = vertexAt(i, j + 1);

        if (opts.polygonType === "square") {
          const quad = [v00, v10, v11, v01];
          const sample = sampleAt(...centroid(quad));
          if (sample) parts.push(polygonElement(quad, colorStr(sample), opts.strokeColor, opts.strokeWidth));
        } else {
          const flip = (i + j) % 2 === 0;
          const triA = flip ? [v00, v10, v11] : [v00, v10, v01];
          const triB = flip ? [v00, v11, v01] : [v10, v11, v01];
          for (const tri of [triA, triB]) {
            const sample = sampleAt(...centroid(tri));
            if (sample) parts.push(polygonElement(tri, colorStr(sample), opts.strokeColor, opts.strokeWidth));
          }
        }
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    `<defs><clipPath id="lp"><rect width="${W}" height="${H}"/></clipPath></defs>`,
    opts.transparent ? "" : `<rect width="${W}" height="${H}" fill="${opts.background}"/>`,
    `<g clip-path="url(#lp)">`,
    parts.join(""),
    `</g>`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function sampleSphereSvg(): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">`,
    `<defs><radialGradient id="sphere" cx="35%" cy="32%" r="70%">`,
    `<stop offset="0%" stop-color="#bfe3ff"/>`,
    `<stop offset="45%" stop-color="#3b82f6"/>`,
    `<stop offset="100%" stop-color="#0b1a3a"/>`,
    `</radialGradient></defs>`,
    `<circle cx="100" cy="100" r="92" fill="url(#sphere)"/>`,
    `</svg>`,
  ].join("");
}
