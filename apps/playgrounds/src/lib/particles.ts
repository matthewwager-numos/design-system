export type ParticleShape = "circle" | "square" | "mixed";
export type ColorMode = "single" | "sample" | "rainbow";
export type ExplodeMode = "radial" | "directional" | "noise" | "up" | "down";
export type AssembleBias = "random" | "center" | "edges" | "left" | "top";
export type EasingMode = "ease" | "linear" | "snap";
export type SamplingMode = "fill" | "outline";

export interface ParticlePoint {
  x: number;
  y: number;
  color: string;
  alpha: number;
}

export interface ParticleOptions {
  particleCount: number;
  particleSize: number;
  shape: ParticleShape;
  particleColor: string;
  colorMode: ColorMode;
  duration: number;
  scatter: number;
  explodeMode: ExplodeMode;
  assembleBias: AssembleBias;
  jitter: number;
  hold: number;
  stagger: number;
  easing: EasingMode;
  canvasWidth: number;
  canvasHeight: number;
  logoScale: number;
  renderScale: number;
  backgroundColor: string;
  transparentBg: boolean;
  samplingMode: SamplingMode;
  seed: number;
}

// ─── RNG ─────────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randRange(rng: () => number, min: number, max: number) {
  return min + rng() * (max - min);
}
function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(randRange(rng, min, max + 1));
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

export function sanitizeSvg(markup: string): string {
  return String(markup || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .trim();
}

function getViewBox(markup: string): { x: number; y: number; w: number; h: number } {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return { x: 0, y: 0, w: 320, h: 320 };
  const vb = svg.getAttribute("viewBox");
  if (vb) {
    const n = vb.trim().split(/[\s,]+/).map(Number);
    if (n.length === 4 && n.every(Number.isFinite)) {
      // n is number[] of length 4 — all elements present
      return { x: n[0] as number, y: n[1] as number, w: n[2] as number, h: n[3] as number };
    }
  }
  return {
    x: 0, y: 0,
    w: parseFloat(svg.getAttribute("width") ?? "") || 320,
    h: parseFloat(svg.getAttribute("height") ?? "") || 320,
  };
}

function normalizeSvg(markup: string): string {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid SVG markup.");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("No <svg> element found.");
  const vb = getViewBox(markup);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", String(Math.max(1, Math.round(vb.w))));
  svg.setAttribute("height", String(Math.max(1, Math.round(vb.h))));
  svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  doc.querySelectorAll("script, foreignObject").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((a) => { if (/^on/i.test(a.name)) node.removeAttribute(a.name); });
  });
  return new XMLSerializer().serializeToString(svg);
}

function loadSvgAsImage(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let normalized: string;
    try { normalized = normalizeSvg(markup); } catch (e) { reject(e); return; }
    const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(normalized);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Browser could not rasterize this SVG. Try simplifying it or outlining text."));
    img.src = src;
  });
}

// ─── Sampling ────────────────────────────────────────────────────────────────

async function sampleFill(markup: string, opts: ParticleOptions): Promise<ParticlePoint[]> {
  const rng = mulberry32(opts.seed);
  const vb = getViewBox(markup);
  const scale = Math.min(
    (opts.canvasWidth * opts.logoScale / 100) / vb.w,
    (opts.canvasHeight * opts.logoScale / 100) / vb.h,
  );
  const drawW = vb.w * scale;
  const drawH = vb.h * scale;
  const ox = (opts.canvasWidth - drawW) / 2;
  const oy = (opts.canvasHeight - drawH) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = opts.canvasWidth;
  canvas.height = opts.canvasHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(await loadSvgAsImage(markup), ox, oy, drawW, drawH);
  const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const step = Math.max(1, Math.floor(Math.sqrt((opts.canvasWidth * opts.canvasHeight) / (opts.particleCount * 50))));
  const candidates: ParticlePoint[] = [];
  for (let y = 0; y < opts.canvasHeight; y += step) {
    for (let x = 0; x < opts.canvasWidth; x += step) {
      const i = (y * opts.canvasWidth + x) * 4;
      const a = px[i + 3] ?? 0;
      if (a > 24) {
        candidates.push({
          x: x + randRange(rng, -step / 2, step / 2),
          y: y + randRange(rng, -step / 2, step / 2),
          color: `rgb(${px[i] ?? 0},${px[i + 1] ?? 0},${px[i + 2] ?? 0})`,
          alpha: a / 255,
        });
      }
    }
  }
  if (!candidates.length) throw new Error("No visible pixels found. Try a simpler filled SVG.");
  return Array.from({ length: opts.particleCount }, () => {
    const c = candidates[randInt(rng, 0, candidates.length - 1)]!;
    return { x: c.x, y: c.y, color: c.color, alpha: c.alpha };
  });
}

function sampleOutline(markup: string, opts: ParticleOptions): ParticlePoint[] {
  const normalized = normalizeSvg(markup);
  const doc = new DOMParser().parseFromString(normalized, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("No SVG element found.");
  const vb = getViewBox(markup);
  const scale = Math.min(
    (opts.canvasWidth * opts.logoScale / 100) / vb.w,
    (opts.canvasHeight * opts.logoScale / 100) / vb.h,
  );
  const ox = (opts.canvasWidth - vb.w * scale) / 2 - vb.x * scale;
  const oy = (opts.canvasHeight - vb.h * scale) / 2 - vb.y * scale;
  const rng = mulberry32(opts.seed);

  const temp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  temp.setAttribute("width", String(opts.canvasWidth));
  temp.setAttribute("height", String(opts.canvasHeight));
  Object.assign(temp.style, { position: "absolute", left: "-99999px", visibility: "hidden" });
  document.body.appendChild(temp);

  type D = { node: SVGGeometryElement; len: number; color: string };
  const drawable: D[] = [];
  svg.querySelectorAll("path,circle,rect,ellipse,line,polyline,polygon").forEach((node) => {
    const clone = document.importNode(node, true) as SVGGeometryElement;
    temp.appendChild(clone);
    try {
      if (typeof clone.getTotalLength === "function") {
        const len = clone.getTotalLength();
        if (len > 0) drawable.push({ node: clone, len, color: clone.getAttribute("fill") || clone.getAttribute("stroke") || opts.particleColor });
      }
    } catch { /* skip unsupported elements */ }
  });

  if (!drawable.length) { temp.remove(); throw new Error("No sampleable paths found. Switch to fill sampling."); }
  const total = drawable.reduce((s, d) => s + d.len, 0);
  const points: ParticlePoint[] = [];
  for (let i = 0; i < opts.particleCount; i++) {
    let pick = rng() * total;
    // drawable is non-empty (checked above)
    let chosen = drawable[0]!;
    for (const d of drawable) { pick -= d.len; if (pick <= 0) { chosen = d; break; } }
    const p = chosen.node.getPointAtLength(rng() * chosen.len);
    points.push({ x: p.x * scale + ox, y: p.y * scale + oy, color: chosen.color, alpha: 1 });
  }
  temp.remove();
  return points;
}

export async function samplePoints(markup: string, opts: ParticleOptions): Promise<ParticlePoint[]> {
  if (opts.samplingMode === "outline") return sampleOutline(markup, opts);
  try {
    return await sampleFill(markup, opts);
  } catch (err) {
    console.warn("Fill sampling failed, falling back to outline:", err);
    return sampleOutline(markup, opts);
  }
}

// ─── Animation builder ───────────────────────────────────────────────────────

function colorFor(p: ParticlePoint, i: number, opts: ParticleOptions): string {
  if (opts.colorMode === "sample" && p.color && !p.color.includes("0,0,0")) return p.color;
  if (opts.colorMode === "rainbow") return `hsl(${Math.round((i / opts.particleCount) * 360)},90%,68%)`;
  return opts.particleColor;
}

function dotEl(shape: "circle" | "square", size: number, fill: string): string {
  const r = size / 2;
  if (shape === "square") return `<rect x="${-r}" y="${-r}" width="${size}" height="${size}" rx="${(size * 0.12).toFixed(2)}" fill="${fill}"/>`;
  return `<circle cx="0" cy="0" r="${r.toFixed(2)}" fill="${fill}"/>`;
}

function buildKeySplines(mode: EasingMode, n: number, isMulti: boolean): string {
  if (mode === "linear") return 'calcMode="linear"';
  const s = mode === "snap" ? ".85 0 .15 1" : ".45 0 .2 1";
  const f = ".2 0 .1 1";
  const pattern = isMulti ? [s, f, s, s, f, s] : [s, f, s, f];
  const splines = Array.from({ length: n }, (_, i) => pattern[i % pattern.length]).join("; ");
  return `calcMode="spline" keySplines="${splines}"`;
}

function sortKey(p: ParticlePoint, opts: ParticleOptions, rng: () => number): number {
  const cx = opts.canvasWidth / 2, cy = opts.canvasHeight / 2;
  const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
  if (opts.assembleBias === "center") return dist;
  if (opts.assembleBias === "edges") return -dist;
  if (opts.assembleBias === "left") return p.x;
  if (opts.assembleBias === "top") return p.y;
  return rng() * opts.canvasWidth;
}

function scatter(p: { x: number; y: number }, opts: ParticleOptions, rng: () => number, flip = 1): { x: number; y: number } {
  const cx = opts.canvasWidth / 2, cy = opts.canvasHeight / 2;
  let angle: number;
  if (opts.explodeMode === "directional") angle = -Math.PI / 8;
  else if (opts.explodeMode === "up") angle = -Math.PI / 2;
  else if (opts.explodeMode === "down") angle = Math.PI / 2;
  else if (opts.explodeMode === "noise") angle = Math.sin(p.x * 0.018 + p.y * 0.011 + opts.seed) * Math.PI * 2;
  else angle = Math.atan2(p.y - cy, p.x - cx);
  angle += randRange(rng, -0.85, 0.85);
  const dist = opts.scatter * (0.35 + rng() * 0.85);
  return {
    x: p.x + Math.cos(angle) * dist * flip + randRange(rng, -opts.jitter, opts.jitter),
    y: p.y + Math.sin(angle) * dist * flip + randRange(rng, -opts.jitter, opts.jitter),
  };
}

function applyRenderScale(p: ParticlePoint, opts: ParticleOptions): ParticlePoint {
  const s = opts.renderScale / 100;
  const cx = opts.canvasWidth / 2, cy = opts.canvasHeight / 2;
  return { ...p, x: cx + (p.x - cx) * s, y: cy + (p.y - cy) * s };
}

function fmt(n: number): string { return n.toFixed(2); }

// Convert SVG markup to an inline data URL safe for use as <image href>.
function svgToDataUrl(markup: string): string {
  try {
    const normalized = normalizeSvg(markup);
    // TextEncoder → binary string → btoa avoids the deprecated unescape() trick
    const bytes = new TextEncoder().encode(normalized);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return "data:image/svg+xml;base64," + btoa(binary);
  } catch {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
  }
}

// Rectangle that exactly covers where assembled particles sit, matching the
// transform applied by sampleFill (logoScale) + applyRenderScale (renderScale).
function imgRect(markup: string, opts: ParticleOptions) {
  const vb = getViewBox(markup);
  const s = Math.min(
    (opts.canvasWidth * opts.logoScale / 100) / vb.w,
    (opts.canvasHeight * opts.logoScale / 100) / vb.h,
  );
  const rs = opts.renderScale / 100;
  const dw = vb.w * s * rs;
  const dh = vb.h * s * rs;
  const cx = opts.canvasWidth / 2;
  const cy = opts.canvasHeight / 2;
  return { x: cx - dw / 2, y: cy - dh / 2, w: dw, h: dh };
}

// Build an <image> element whose opacity animates in sync with particle assembly.
// Placed behind particles so it fills gaps as the shape comes together.
function buildImageOverlay(
  markup: string,
  opts: ParticleOptions,
  keyTimes: string,
  opValues: string,
): string {
  const { x, y, w, h } = imgRect(markup, opts);
  const url = svgToDataUrl(markup);
  return (
    `<image href="${url}" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" opacity="0">` +
    `<animate attributeName="opacity" values="${opValues}" keyTimes="${keyTimes}" dur="${opts.duration}s" begin="0s" repeatCount="indefinite" calcMode="linear"/>` +
    `</image>`
  );
}

export function buildAnimatedSvg(
  points: ParticlePoint[],
  opts: ParticleOptions,
  pointsB: ParticlePoint[] | null = null,
  sourceA?: string,
  sourceB?: string,
): string {
  const rng = mulberry32(opts.seed + 999);
  const bg = opts.transparentBg ? "" : `<rect width="100%" height="100%" fill="${opts.backgroundColor}"/>`;
  const hold = clamp(opts.hold / 100, 0, 0.5);
  const isMulti = pointsB != null;

  const ranked = points
    .map((p, i) => ({ i, rank: sortKey(p, opts, rng) }))
    .sort((a, b) => a.rank - b.rank);
  const staggerOrder = new Map(ranked.map((item, idx) => [item.i, idx / Math.max(1, ranked.length - 1)]));

  const parts: string[] = [];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i]!;
    const pA = applyRenderScale(pt, opts);
    const pB = pointsB ? applyRenderScale(pointsB[i % pointsB.length]!, opts) : null;
    const sA = scatter(pA, opts, rng, 1);
    const sB = scatter(pB ?? pA, opts, rng, -1);

    const delayFrac = staggerOrder.get(i) ?? 0;
    const begin = -(delayFrac * opts.duration * (opts.stagger / 100)).toFixed(3);

    const fill = colorFor(pt, i, opts);
    const sz = Math.max(1, opts.particleSize * (0.65 + rng() * 0.7));
    const particleType: "circle" | "square" =
      opts.shape === "mixed" ? (i % 3 === 0 ? "square" : "circle") : (opts.shape === "square" ? "square" : "circle");
    const el = dotEl(particleType, sz, fill);
    const op = clamp(pt.alpha, 0.2, 1).toFixed(2);

    let values: string, keyTimes: string, opValues: string;
    let segCount: number;

    if (pB) {
      const t = [0, 0.18 - hold / 5, 0.36 + hold / 5, 0.5, 0.64 - hold / 5, 0.82 + hold / 5, 1];
      keyTimes = t.map((v) => v.toFixed(3)).join("; ");
      values = [sA, pA, pA, sB, pB, pB, sA].map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join("; ");
      opValues = `0; ${op}; ${op}; .15; ${op}; ${op}; 0`;
      segCount = 6;
    } else {
      const t1 = 0.25 - hold / 3;
      const t3 = 0.75 + hold / 3;
      keyTimes = `0; ${t1.toFixed(3)}; 0.500; ${t3.toFixed(3)}; 1`;
      values = [sA, pA, pA, sB, sA].map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join("; ");
      opValues = `0; ${op}; ${op}; .15; 0`;
      segCount = 4;
    }

    const ease = buildKeySplines(opts.easing, segCount, isMulti);

    parts.push(
      `<g transform="translate(${fmt(sA.x)} ${fmt(sA.y)})">` +
      el +
      `<animateTransform attributeName="transform" type="translate" additive="replace" values="${values}" keyTimes="${keyTimes}" dur="${opts.duration}s" begin="${begin}s" repeatCount="indefinite" ${ease}/>` +
      `<animate attributeName="opacity" values="${opValues}" keyTimes="${keyTimes}" dur="${opts.duration}s" begin="${begin}s" repeatCount="indefinite"/>` +
      `</g>`,
    );
  }

  // SVG fill overlay — sits behind particles, fades in as they assemble so
  // the shape looks fully filled even with low particle counts.
  let imageLayer = "";
  // δ: tiny fraction of the cycle used for the snap fade-out (~0.1 s on a 4 s loop)
  const δ = 0.025;

  if (sourceA) {
    try {
      if (isMulti && sourceB) {
        const t1a = 0.18 - hold / 5;  // A fully assembled
        const t2a = 0.36 + hold / 5;  // A starts scattering
        const t1b = 0.64 - hold / 5;  // B fully assembled
        const t2b = 0.82 + hold / 5;  // B starts scattering
        const t = [
          0, t1a, t2a, Math.min(t2a + δ, 0.49),
          0.5,
          t1b, t2b, Math.min(t2b + δ, 0.99), 1,
        ];
        const kt = t.map((v) => v.toFixed(3)).join("; ");
        // A: fade in during assembly, snap out when scatter begins
        // B: same, offset by half a cycle
        imageLayer =
          buildImageOverlay(sourceA, opts, kt, "0; 1; 1; 0; 0; 0; 0; 0; 0") +
          buildImageOverlay(sourceB, opts, kt, "0; 0; 0; 0; 0; 1; 1; 0; 0");
      } else {
        const t1 = 0.25 - hold / 3;
        const t3 = 0.75 + hold / 3;
        const tSnap = Math.min(t3 + δ, 0.99);
        const kt = `0; ${t1.toFixed(3)}; 0.500; ${t3.toFixed(3)}; ${tSnap.toFixed(3)}; 1`;
        imageLayer = buildImageOverlay(sourceA, opts, kt, "0; 1; 1; 1; 0; 0");
      }
    } catch { /* skip overlay if SVG can't be embedded */ }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${opts.canvasWidth} ${opts.canvasHeight}" width="${opts.canvasWidth}" height="${opts.canvasHeight}">`,
    bg,
    imageLayer,
    `<g>${parts.join("")}</g>`,
    `</svg>`,
  ].join("\n");
}
