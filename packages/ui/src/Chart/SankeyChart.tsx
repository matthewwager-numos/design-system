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
  /**
   * Lays the node out (and gives its links a real endpoint) without
   * drawing its own marker — for a link that terminates by leaving the
   * flow entirely (attrition, drop-off) rather than continuing on to
   * another real, visible stage. Pair with a `stage` matching wherever the
   * drop-off should visually branch away, not a stage of its own.
   */
  hidden?: boolean;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  /** Shown in the hover tooltip — defaults to `"{source} → {target}"`. */
  label?: string;
  /**
   * Omits the tooltip's second line (`value`, shown below `label`) — for
   * when `label` already reads as a complete sentence with the number
   * folded in (e.g. `"20 moved to assigned"`), rather than a plain
   * description that still needs the raw value stated alongside it.
   */
  omitTooltipValue?: boolean;
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
  /**
   * Renders every ribbon and node in this single color instead of each
   * link picking its own from the categorical palette by index (a
   * per-link `color` still overrides this). Nodes render at full opacity;
   * ribbons keep the usual `chartColorMuted` (50%) default and brighten to
   * full opacity on hover/focus — the same interaction as the default
   * multi-color mode, just one color instead of many.
   */
  color?: string;
  /**
   * Node marker thickness in real px, regardless of the chart's own
   * rendered width — drawn as a stroked line with `vector-effect:
   * non-scaling-stroke` rather than a fill shape, the same technique
   * `<LineChart>` already uses to keep its own line width constant.
   * Defaults to a thin 3px marker.
   */
  nodeWidth?: number;
  /**
   * `"edges"` (default) spreads stages from the chart's own left edge to
   * its right edge — matches Figma's own layout. `"centers"` splits the
   * width into equal bands and centers each stage within its own band.
   * `"start"` instead aligns each stage to its band's own *left* edge —
   * for lining a Sankey up against a same-width column layout whose own
   * headings are left-aligned rather than centered (a kanban board's own
   * column titles, for instance), where each stage needs to sit under the
   * start of its column, not the middle.
   */
  stageAlign?: "edges" | "centers" | "start";
  /**
   * How many equal bands `"centers"`/`"start"` divide the width into.
   * Defaults to the number of distinct `stage` values actually present in
   * `nodes` — only needed explicitly when that count doesn't match the
   * number of *visual* columns, e.g. `"start"` plus one extra hidden
   * trailing stage purely to let the last real stage's ribbon fill out its
   * own column's full width instead of stopping dead at the bar.
   */
  columnCount?: number;
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
 * rather than needing a separate "dimmed" state. Pass `color` for a
 * one-color chart instead of the default categorical palette — nodes at
 * full opacity, ribbons at the same muted/full split as always, just one
 * color throughout instead of one per link.
 */
export function SankeyChart({
  nodes,
  links,
  stageLabels,
  showStageLabels = true,
  showLegend = true,
  legend,
  color,
  nodeWidth = 3,
  stageAlign = "edges",
  columnCount,
  height = 220,
  className,
}: SankeyChartProps) {
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();
  const stageNumbers = Array.from(new Set(nodes.map((n) => n.stage))).sort((a, b) => a - b);
  const bandCount = columnCount ?? stageNumbers.length;
  const stageX = (stage: number) => {
    const index = stageNumbers.indexOf(stage);
    if (stageAlign === "centers") return ((index + 0.5) / bandCount) * 100;
    if (stageAlign === "start") return (index / bandCount) * 100;
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
          const linkColor = link.color ?? color ?? chartColor(i);
          const label = link.label ?? `${link.source} → ${link.target}`;
          const tooltipPoint = { label, value: link.omitTooltipValue ? "" : String(link.value), color: linkColor };
          return (
            <path
              key={key}
              d={ribbonPath(link)}
              fill={hoveredKey === key ? linkColor : chartColorMuted(linkColor)}
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
          if (node.hidden) return null;
          const layout = layoutById.get(node.id);
          if (!layout) return null;
          // A stroked line at a constant real px width (vector-effect
          // cancels out the viewBox's own scaling) rather than a fill
          // shape sized in viewBox units — the only way to get an exact
          // px thickness regardless of the chart's rendered width. Since
          // `.ds-sankey-chart__plot` is `overflow: visible`, a stage at
          // the very edge (x=0 or x=100) isn't clipped even though half
          // its stroke width technically falls outside the nominal box.
          return (
            <line
              key={node.id}
              x1={layout.x}
              x2={layout.x}
              y1={layout.yTop}
              y2={Math.max(layout.yBottom, layout.yTop)}
              stroke={color ?? "var(--border-emphasis)"}
              strokeWidth={nodeWidth}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {showLegend && legend && legend.length > 0 && <ChartLegend items={legend} />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
