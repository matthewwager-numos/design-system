export type DotShape = "circle" | "square" | "diamond";

export interface DitherOptions {
  cellSize: number;   // grid spacing in SVG units
  dotScale: number;   // max dot radius as fraction of cellSize/2 (0–1.2 allows slight overlap)
  shape: DotShape;
  angle: number;      // halftone grid rotation in degrees
  fg: string;         // dot color (hex)
  bg: string;         // background color (hex)
  invert: boolean;    // swap which tone gets the large dots
}

async function svgToCanvas(svgString: string, w: number, h: number, bg: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load SVG — make sure it has valid dimensions"));
    img.src = url;
  });
  URL.revokeObjectURL(url);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

// Average luminance over a small kernel to smooth noise at cell boundaries
function sampleLuma(data: Uint8ClampedArray, w: number, h: number, px: number, py: number): number {
  let sum = 0;
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const xi = Math.max(0, Math.min(w - 1, Math.round(px + dx)));
      const yi = Math.max(0, Math.min(h - 1, Math.round(py + dy)));
      const b = (yi * w + xi) * 4;
      sum += 0.299 * data[b] + 0.587 * data[b + 1] + 0.114 * data[b + 2];
      count++;
    }
  }
  return sum / count;
}

function dotElement(shape: DotShape, px: number, py: number, r: number): string {
  const x = px.toFixed(2);
  const y = py.toFixed(2);
  const rv = r.toFixed(2);
  if (shape === "circle") {
    return `<circle cx="${x}" cy="${y}" r="${rv}"/>`;
  }
  const side = (r * 2).toFixed(2);
  const ox = (px - r).toFixed(2);
  const oy = (py - r).toFixed(2);
  if (shape === "square") {
    return `<rect x="${ox}" y="${oy}" width="${side}" height="${side}"/>`;
  }
  // diamond: square rotated 45° around its center
  return `<rect x="${ox}" y="${oy}" width="${side}" height="${side}" transform="rotate(45 ${x} ${y})"/>`;
}

export async function ditherSvg(svgString: string, opts: DitherOptions): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.documentElement;
  const parseErr = svgEl.querySelector("parsererror");
  if (parseErr) throw new Error("Invalid SVG file");

  const vb = svgEl.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
  const W = vb?.[2] ?? Number(svgEl.getAttribute("width") || 400);
  const H = vb?.[3] ?? Number(svgEl.getAttribute("height") || 400);

  const canvas = await svgToCanvas(svgString, W, H, opts.bg);
  const { data } = canvas.getContext("2d")!.getImageData(0, 0, W, H);

  const cs = Math.max(2, opts.cellSize);
  const maxR = (cs / 2) * Math.min(1.2, opts.dotScale);

  const angleRad = (opts.angle * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const ocx = W / 2;
  const ocy = H / 2;

  // Extend sampling grid so rotated dots cover all corners
  const diag = Math.sqrt(W * W + H * H) / 2;
  const extra = (Math.ceil(diag / cs) + 1) * cs;

  const dots: string[] = [];

  for (let row = -extra; row < H + extra; row += cs) {
    for (let col = -extra; col < W + extra; col += cs) {
      // Rotate grid point around SVG center
      const dx = col - ocx;
      const dy = row - ocy;
      const px = cosA * dx - sinA * dy + ocx;
      const py = sinA * dx + cosA * dy + ocy;

      // Discard dots too far outside the viewport
      if (px < -cs || px > W + cs || py < -cs || py > H + cs) continue;

      const luma = sampleLuma(data, W, H, px, py);
      const t = opts.invert ? luma / 255 : 1 - luma / 255;
      const r = t * maxR;
      if (r < 0.5) continue;

      dots.push(dotElement(opts.shape, px, py, r));
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    `<defs><clipPath id="hc"><rect width="${W}" height="${H}"/></clipPath></defs>`,
    `<rect width="${W}" height="${H}" fill="${opts.bg}"/>`,
    `<g fill="${opts.fg}" clip-path="url(#hc)">`,
    dots.join(""),
    `</g>`,
    `</svg>`,
  ].join("");
}
