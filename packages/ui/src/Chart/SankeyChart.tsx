import type { FocusEvent, MouseEvent } from "react";
import { clsx } from "clsx";
import { ChartLegend, type ChartLegendItem } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, chartColorMuted } from "./chartColors";
import { useChartHover } from "./useChartHover";
import "./SankeyChart.css";

export interface SankeyNode {
  id: string;
  /** Which column this node sits in — not auto-derived, since an arbitrary link graph has no single correct ordering. */
  stage: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  /** Shown in the hover tooltip — defaults to `"{source} → {target}"`. */
  label?: string;
  /** Defaults to the palette color at this link's index. */
  color?: string;
}

export interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  /** Labels for the top stage row, in ascending stage order. Defaults to each stage's own number. */
  stageLabels?: string[];
  showStageLabels?: boolean;
  showLegend?: boolean;
  /**
   * Legend content is genuinely data-specific here (there's no single
   * "series" a link belongs to the way bar/line/donut data does) — pass
   * whatever grouping makes sense for `links` (e.g. by source node).
   */
  legend?: ChartLegendItem[];
  height?: number;
  className?: string;
}

const NODE_GAP = 8;

/**
 * A Sankey flow diagram — matches Figma's color palette and stage-label
 * row, but Figma's own ribbons are 71 flattened SVG vector fragments, not
 * real flow data. This lays out `nodes`/`links` from first principles:
 * nodes stacked within their `stage` column sized by throughput, links
 * drawn as smooth ribbons sized by `value` and stacked in input order
 * along each endpoint. Ribbons default to their `chartColorMuted` (50%)
 * variant — hovering (or focusing) one brings it to full color and shows
 * its value in a tooltip, leaving the rest at their default translucency
 * rather than needing a separate "dimmed" state.
 */
export function SankeyChart({
  nodes,
  links,
  stageLabels,
  showStageLabels = true,
  showLegend = true,
  legend,
  height = 220,
  className,
}: SankeyChartProps) {
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();
  const stageNumbers = Array.from(new Set(nodes.map((n) => n.stage))).sort((a, b) => a - b);
  const stageX = (stage: number) => {
    const index = stageNumbers.indexOf(stage);
    return stageNumbers.length > 1 ? (index / (stageNumbers.length - 1)) * 100 : 50;
  };

  const outSumById = new Map<string, number>();
  const inSumById = new Map<string, number>();
  for (const link of links) {
    outSumById.set(link.source, (outSumById.get(link.source) ?? 0) + link.value);
    inSumById.set(link.target, (inSumById.get(link.target) ?? 0) + link.value);
  }
  const nodeValue = (id: string) => Math.max(outSumById.get(id) ?? 0, inSumById.get(id) ?? 0, 0.0001);

  const layoutById = new Map<string, { x: number; yTop: number; yBottom: number }>();
  for (const stage of stageNumbers) {
    const stageNodes = nodes.filter((n) => n.stage === stage);
    const totalValue = stageNodes.reduce((sum, n) => sum + nodeValue(n.id), 0) || 1;
    const totalGap = NODE_GAP * Math.max(0, stageNodes.length - 1);
    const available = Math.max(height - totalGap, 1);
    let y = 0;
    for (const node of stageNodes) {
      const nodeHeight = (nodeValue(node.id) / totalValue) * available;
      layoutById.set(node.id, { x: stageX(stage), yTop: y, yBottom: y + nodeHeight });
      y += nodeHeight + NODE_GAP;
    }
  }

  // Slices each side of a node among its own links, in input order,
  // proportional to that side's own total — so both sides fully tile the
  // node's rendered height even when a node's in/out totals differ.
  function sliceSide(sideLinks: SankeyLink[], sideTotal: number, layout: { yTop: number; yBottom: number }) {
    const span = layout.yBottom - layout.yTop;
    let cursor = layout.yTop;
    const result = new Map<SankeyLink, { y0: number; y1: number }>();
    for (const link of sideLinks) {
      const linkHeight = sideTotal > 0 ? (link.value / sideTotal) * span : 0;
      result.set(link, { y0: cursor, y1: cursor + linkHeight });
      cursor += linkHeight;
    }
    return result;
  }

  const outSlicesByNode = new Map<string, Map<SankeyLink, { y0: number; y1: number }>>();
  const inSlicesByNode = new Map<string, Map<SankeyLink, { y0: number; y1: number }>>();
  for (const node of nodes) {
    const layout = layoutById.get(node.id);
    if (!layout) continue;
    outSlicesByNode.set(node.id, sliceSide(links.filter((l) => l.source === node.id), outSumById.get(node.id) ?? 0, layout));
    inSlicesByNode.set(node.id, sliceSide(links.filter((l) => l.target === node.id), inSumById.get(node.id) ?? 0, layout));
  }

  function ribbonPath(link: SankeyLink) {
    const sourceLayout = layoutById.get(link.source);
    const targetLayout = layoutById.get(link.target);
    const sourceSlice = outSlicesByNode.get(link.source)?.get(link);
    const targetSlice = inSlicesByNode.get(link.target)?.get(link);
    if (!sourceLayout || !targetLayout || !sourceSlice || !targetSlice) return "";
    const sx = sourceLayout.x;
    const tx = targetLayout.x;
    const midX = (sx + tx) / 2;
    return [
      `M ${sx},${sourceSlice.y0}`,
      `C ${midX},${sourceSlice.y0} ${midX},${targetSlice.y0} ${tx},${targetSlice.y0}`,
      `L ${tx},${targetSlice.y1}`,
      `C ${midX},${targetSlice.y1} ${midX},${sourceSlice.y1} ${sx},${sourceSlice.y1}`,
      "Z",
    ].join(" ");
  }

  return (
    <div className={clsx("ds-sankey-chart", className)}>
      {showStageLabels && (
        <div className="ds-sankey-chart__stage-labels">
          {stageNumbers.map((stage, i) => (
            <span className="ds-sankey-chart__stage-label" key={stage}>
              {stageLabels?.[i] ?? String(stage)}
            </span>
          ))}
        </div>
      )}
      <svg className="ds-sankey-chart__plot" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ height }}>
        {links.map((link, i) => {
          const key = `${link.source}->${link.target}:${i}`;
          const color = link.color ?? chartColor(i);
          const label = link.label ?? `${link.source} → ${link.target}`;
          const tooltipPoint = { label, value: String(link.value), color };
          return (
            <path
              key={key}
              d={ribbonPath(link)}
              fill={hoveredKey === key ? color : chartColorMuted(color)}
              className="ds-sankey-chart__ribbon"
              tabIndex={0}
              role="img"
              aria-label={`${label}: ${link.value}`}
              onMouseEnter={(event: MouseEvent) => showTooltipAtPoint(key, event.clientX, event.clientY, tooltipPoint)}
              onMouseMove={(event: MouseEvent) => showTooltipAtPoint(key, event.clientX, event.clientY, tooltipPoint)}
              onMouseLeave={hideTooltip}
              onFocus={(event: FocusEvent) => showTooltipAtElement(key, event.currentTarget, tooltipPoint)}
              onBlur={hideTooltip}
            />
          );
        })}
        {nodes.map((node) => {
          const layout = layoutById.get(node.id);
          if (!layout) return null;
          const stageIndex = stageNumbers.indexOf(node.stage);
          // Center the marker on its stage's x — except at the first/last
          // stage, where centering would push half the rect outside the
          // viewBox (invisible); there, keep the marker's outer edge
          // flush with the chart's own edge instead.
          const nodeWidth = 2;
          const rectX =
            stageIndex === 0
              ? 0
              : stageIndex === stageNumbers.length - 1
                ? 100 - nodeWidth
                : layout.x - nodeWidth / 2;
          return (
            <rect
              key={node.id}
              x={rectX}
              y={layout.yTop}
              width={nodeWidth}
              height={Math.max(layout.yBottom - layout.yTop, 0)}
              fill="var(--border-emphasis)"
            />
          );
        })}
      </svg>
      {showLegend && legend && legend.length > 0 && <ChartLegend items={legend} />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
