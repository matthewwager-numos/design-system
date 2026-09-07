import { useId } from "react";
import type { CSSProperties, FocusEvent, MouseEvent } from "react";
import { clsx } from "clsx";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, chartColorMuted } from "./chartColors";
import { useChartHover } from "./useChartHover";
import "./DonutChart.css";

export interface DonutChartDatum {
  label: string;
  value: number;
  /** Defaults to the palette color at this datum's index. */
  color?: string;
}

export interface DonutChartProps {
  data: DonutChartDatum[];
  /** Defaults to the sum of `data`'s values. */
  centerValue?: string;
  /** The small line below the center value — omit for no sub-label. */
  centerLabel?: string;
  showLegend?: boolean;
  /** Toggles the center value/label text. */
  showCenterLabel?: boolean;
  /** Ring outer diameter in px. */
  size?: number;
  /** Ring stroke thickness, in the same px units as `size`. */
  thickness?: number;
  className?: string;
}

// 0 = 12 o'clock, increasing clockwise (subtracting a quarter turn bakes in
// the "start at top" convention directly, instead of a separate SVG
// `rotate()` transform on the whole group).
function arcPoint(radius: number, fraction: number): { x: number; y: number } {
  const angle = fraction * 2 * Math.PI - Math.PI / 2;
  return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
}

// A real annular wedge (outer arc + inner arc, computed from the segment's
// actual start/end fractions), not a stroke-dasharray trick on a full
// circle — dasharray boundaries on a circular path are independently
// anti-aliased per segment, which for a short dash (a small slice) can
// render as a visibly kinked/notched edge rather than a clean radial cut.
// A real path has one continuous, precisely-computed boundary instead.
function donutSlicePath(innerRadius: number, outerRadius: number, startFraction: number, endFraction: number): string {
  const largeArc = endFraction - startFraction > 0.5 ? 1 : 0;
  const outerStart = arcPoint(outerRadius, startFraction);
  const outerEnd = arcPoint(outerRadius, endFraction);
  const innerEnd = arcPoint(innerRadius, endFraction);
  const innerStart = arcPoint(innerRadius, startFraction);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/**
 * A donut chart — matches Figma's Donut colors, center-text typography
 * (Heading 2XL value / Heading XS label), and side-positioned vertical
 * legend exactly. Figma's own ring is 5 flattened SVG vector fragments, not
 * real arc data, so the arcs here are computed from `data`'s real value
 * proportions as annular wedge paths, not a reproduction of that image.
 * Hovering (or focusing) a segment shows its value in a tooltip and dims
 * the others to their `chartColorMuted` variant.
 */
export function DonutChart({
  data,
  centerValue,
  centerLabel,
  showLegend = true,
  showCenterLabel = true,
  size = 120,
  thickness = 16,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const legendItems = data.map((d, i) => ({ label: d.label, color: d.color ?? chartColor(i) }));
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();
  // Scopes the <mask> id to this instance — SVG ids are document-global, so
  // two DonutCharts on one page would otherwise silently share (and fight
  // over) the same mask.
  const maskId = useId();

  const outerRadius = 50;
  const innerRadius = 50 - thickness;
  // The reveal mask: a circle stroked thick enough to cover the whole ring,
  // dashed all the way around its own circumference and animated from
  // fully-offset (nothing showing) to 0 (fully showing) — the standard
  // "circular progress" technique, applied to a <mask> instead of a visible
  // stroke so it sweeps the real annular-wedge segments into view instead
  // of drawing its own ring on top of them. +2 on the stroke width and
  // radius clears the wedges' own outer/inner edges with a little to
  // spare, so antialiasing at the mask's boundary never clips them.
  const maskRadius = (innerRadius + outerRadius) / 2;
  const maskStrokeWidth = outerRadius - innerRadius + 2;
  const maskCircumference = 2 * Math.PI * maskRadius;

  let cumulative = 0;
  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const startFraction = cumulative;
    cumulative += fraction;
    return {
      key: d.label,
      color: d.color ?? chartColor(i),
      startFraction,
      endFraction: cumulative,
      percent: Math.round(fraction * 100),
      value: d.value,
    };
  });

  // A single segment is one full ring with no real color boundary — a
  // divider there would just be a stray line across an otherwise solid ring.
  const dividers =
    data.length > 1
      ? segments.map((segment) => {
          const inner = arcPoint(innerRadius, segment.startFraction);
          const outer = arcPoint(outerRadius, segment.startFraction);
          return { key: segment.key, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
        })
      : [];

  return (
    <div className={clsx("ds-donut-chart", className)}>
      <div className="ds-donut-chart__ring" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <circle
                className="ds-donut-chart__reveal"
                cx={50}
                cy={50}
                r={maskRadius}
                fill="none"
                stroke="white"
                strokeWidth={maskStrokeWidth}
                strokeDasharray={maskCircumference}
                transform="rotate(-90 50 50)"
                style={{ "--ds-donut-circumference": maskCircumference } as CSSProperties}
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            {segments.map((segment) => {
              const tooltipPoint = { label: segment.key, value: `${segment.value} · ${segment.percent}%`, color: segment.color };
              return (
                <path
                  key={segment.key}
                  d={donutSlicePath(innerRadius, outerRadius, segment.startFraction, segment.endFraction)}
                  fill={hoveredKey && hoveredKey !== segment.key ? chartColorMuted(segment.color) : segment.color}
                  tabIndex={0}
                  role="img"
                  aria-label={`${segment.key}: ${segment.value} (${segment.percent}%)`}
                  className="ds-donut-chart__segment"
                  onMouseEnter={(event: MouseEvent) => showTooltipAtPoint(segment.key, event.clientX, event.clientY, tooltipPoint)}
                  onMouseMove={(event: MouseEvent) => showTooltipAtPoint(segment.key, event.clientX, event.clientY, tooltipPoint)}
                  onMouseLeave={hideTooltip}
                  onFocus={(event: FocusEvent) => showTooltipAtElement(segment.key, event.currentTarget, tooltipPoint)}
                  onBlur={hideTooltip}
                />
              );
            })}
            {dividers.map((divider) => (
              <line
                key={`divider-${divider.key}`}
                x1={divider.x1}
                y1={divider.y1}
                x2={divider.x2}
                y2={divider.y2}
                stroke="var(--background-default)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            ))}
          </g>
        </svg>
        {showCenterLabel && (
          <div className="ds-donut-chart__center">
            <span className="ds-donut-chart__center-value">{centerValue ?? total}</span>
            {centerLabel && <span className="ds-donut-chart__center-label">{centerLabel}</span>}
          </div>
        )}
      </div>
      {showLegend && <ChartLegend items={legendItems} orientation="vertical" />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
