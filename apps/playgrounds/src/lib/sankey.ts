function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SankeyNode {
  id: string;
  step: number;
  branchIndex: number;
  weight: number;
  parentId: string | null;
}

export interface SankeyEdge {
  sourceId: string;
  targetId: string;
  weight: number;
  branchIndex: number;
}

export interface SankeyData {
  steps: SankeyNode[][];
  edges: SankeyEdge[][];
}

export function generateSankey(
  numBranches: number,
  numSteps: number,
  splitProb: number,
  seed: number,
): SankeyData {
  const rng = mulberry32(seed);

  const step0: SankeyNode[] = Array.from({ length: numBranches }, (_, i) => ({
    id: `n${i}`,
    step: 0,
    branchIndex: i,
    weight: 1,
    parentId: null,
  }));

  const steps: SankeyNode[][] = [step0];
  const edges: SankeyEdge[][] = [];

  for (let s = 0; s < numSteps; s++) {
    const prev = steps[s];
    const next: SankeyNode[] = [];
    const stepEdges: SankeyEdge[] = [];

    for (const node of prev) {
      if (rng() < splitProb) {
        const a: SankeyNode = {
          id: `${node.id}a`,
          step: s + 1,
          branchIndex: node.branchIndex,
          weight: node.weight * 0.5,
          parentId: node.id,
        };
        const b: SankeyNode = {
          id: `${node.id}b`,
          step: s + 1,
          branchIndex: node.branchIndex,
          weight: node.weight * 0.5,
          parentId: node.id,
        };
        next.push(a, b);
        stepEdges.push(
          { sourceId: node.id, targetId: a.id, weight: a.weight, branchIndex: node.branchIndex },
          { sourceId: node.id, targetId: b.id, weight: b.weight, branchIndex: node.branchIndex },
        );
      } else {
        const c: SankeyNode = {
          id: `${node.id}c`,
          step: s + 1,
          branchIndex: node.branchIndex,
          weight: node.weight,
          parentId: node.id,
        };
        next.push(c);
        stepEdges.push({
          sourceId: node.id,
          targetId: c.id,
          weight: c.weight,
          branchIndex: node.branchIndex,
        });
      }
    }

    steps.push(next);
    edges.push(stepEdges);
  }

  return { steps, edges };
}

export interface SankeyRenderOptions {
  width: number;
  height: number;
  nodeWidth: number;
  nodePadding: number;
  flowOpacity: number;
  bgColor: string;
  transparent: boolean;
}

function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

export function buildSankeySvg(
  { steps, edges }: SankeyData,
  colors: string[],
  opts: SankeyRenderOptions,
): string {
  const { width, height, nodeWidth, nodePadding, flowOpacity, bgColor, transparent } = opts;
  const pad = 36;
  const innerW = width - 2 * pad;
  const innerH = height - 2 * pad;
  const numCols = steps.length;

  const stepX = (s: number) => pad + (s / Math.max(numCols - 1, 1)) * innerW;

  const totalWeight = steps[0].reduce((acc, n) => acc + n.weight, 0);

  type Rect = { yTop: number; yBottom: number };
  const layouts: Map<string, Rect>[] = [];

  for (const stepNodes of steps) {
    const map = new Map<string, Rect>();
    const totalPad = Math.max(0, stepNodes.length - 1) * nodePadding;
    const flowH = innerH - totalPad;
    let y = pad;
    for (let i = 0; i < stepNodes.length; i++) {
      if (i > 0) y += nodePadding;
      const h = Math.max(1, (stepNodes[i].weight / totalWeight) * flowH);
      map.set(stepNodes[i].id, { yTop: y, yBottom: y + h });
      y += h;
    }
    layouts.push(map);
  }

  const nodeById = new Map<string, SankeyNode>();
  for (const step of steps) {
    for (const n of step) nodeById.set(n.id, n);
  }

  const parts: string[] = [];

  if (!transparent) {
    parts.push(`<rect width="${width}" height="${height}" fill="${bgColor}"/>`);
  }

  // Edges first so nodes render on top
  for (let s = 0; s < edges.length; s++) {
    const srcLayout = layouts[s];
    const tgtLayout = layouts[s + 1];
    const srcX = stepX(s) + nodeWidth;
    const tgtX = stepX(s + 1);
    const cpX = (srcX + tgtX) / 2;
    const srcOffsets = new Map<string, number>();

    for (const edge of edges[s]) {
      const srcNode = nodeById.get(edge.sourceId)!;
      const srcRect = srcLayout.get(edge.sourceId)!;
      const tgtRect = tgtLayout.get(edge.targetId)!;

      const srcH = srcRect.yBottom - srcRect.yTop;
      const off = srcOffsets.get(edge.sourceId) ?? 0;
      const edgeH = (edge.weight / srcNode.weight) * srcH;

      const y1t = srcRect.yTop + off;
      const y1b = y1t + edgeH;
      const y2t = tgtRect.yTop;
      const y2b = tgtRect.yBottom;

      srcOffsets.set(edge.sourceId, off + edgeH);

      const color = colors[edge.branchIndex] ?? "#888888";
      const d = [
        `M${fmt(srcX)},${fmt(y1t)}`,
        `C${fmt(cpX)},${fmt(y1t)} ${fmt(cpX)},${fmt(y2t)} ${fmt(tgtX)},${fmt(y2t)}`,
        `L${fmt(tgtX)},${fmt(y2b)}`,
        `C${fmt(cpX)},${fmt(y2b)} ${fmt(cpX)},${fmt(y1b)} ${fmt(srcX)},${fmt(y1b)}`,
        "Z",
      ].join(" ");

      parts.push(`<path d="${d}" fill="${color}" opacity="${flowOpacity}"/>`);
    }
  }

  // Nodes
  for (let s = 0; s < steps.length; s++) {
    const x = stepX(s);
    for (const node of steps[s]) {
      const rect = layouts[s].get(node.id)!;
      const h = rect.yBottom - rect.yTop;
      const color = colors[node.branchIndex] ?? "#888888";
      parts.push(
        `<rect x="${fmt(x)}" y="${fmt(rect.yTop)}" width="${nodeWidth}" height="${fmt(h)}" fill="${color}" rx="2"/>`,
      );
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    ...parts.map((p) => `  ${p}`),
    `</svg>`,
  ].join("\n");
}
