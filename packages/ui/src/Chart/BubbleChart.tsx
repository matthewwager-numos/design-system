import type { FocusEvent, MouseEvent } from "react";
import { clsx } from "clsx";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, chartColorMuted } from "./chartColors";
import { useChartHover } from "./useChartHover";
import "./BubbleChart.css";

export interface BubbleChartDatum {
  label: string;
  /** Position along the x-axis (0-based domain, scaled from `data`'s own max). */
  x: number;
  /** Position along the y-axis (0-based domain, scaled from `data`'s own max). */
  y: number;
  /** The third dimension — scaled to a bubble diameter between `minDiameter` and `maxDiameter`. */
  size: number;
  /** Defaults to the palette color at this datum's index. */
  color?: string;
}

export interface BubbleChartProps {
  data: BubbleChartDatum[];
  showLegend?: boolean;
  showGridLines?: boolean;
  /** The numeric tick values along both axes. */
  showAxisLabels?: boolean;
  /** Number of gridline divisions along the y-axis, not counting the baseline. */
  gridLineCount?: number;
  /** Bubble diameter, in px, at the smallest/largest `size` in `data`. */
  minDiameter?: number;
  maxDiameter?: number;
  height?: number;
  className?: string;
}

/**
 * A bubble chart — matches Figma's Bubble Chart grid/baseline/legend
 * treatment exactly (the same "Chart grid" building block as Bar/Line,
 * except both axes are numeric here rather than one being categories).
 * Figma's own bubbles are 5 flattened SVG images at fixed positions, not
 * real x/y/size data, so the layout here is computed from `data`'s real
 * values instead. Bubbles default to their `chartColorMuted` (50%) fill so
 * overlapping bubbles stay legible — same convention as SankeyChart's
 * ribbons — brightening to full color on hover/focus, which also shows the
 * point's x/y/size in a tooltip.
 */
export function BubbleChart({
  data,
  showLegend = true,
  showGridLines = true,
  showAxisLabels = true,
  gridLineCount = 5,
  minDiameter = 16,
  maxDiameter = 64,
  height = 180,
  className,
}: BubbleChartProps) {
  const xMax = Math.max(1, ...data.map((d) => d.x));
  const yMax = Math.max(1, ...data.map((d) => d.y));
  const sizeMin = Math.min(...data.map((d) => d.size));
  const sizeMax = Math.max(...data.map((d) => d.size));
  const legendItems = data.map((d, i) => ({ label: d.label, color: d.color ?? chartColor(i) }));
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();

  function diameter(size: number) {
    if (sizeMax === sizeMin) return (minDiameter + maxDiameter) / 2;
    const t = (size - sizeMin) / (sizeMax - sizeMin);
    return minDiameter + t * (maxDiameter - minDiameter);
  }

  return (
    <div className={clsx("ds-bubble-chart", className)}>
      <div className="ds-bubble-chart__grid" style={{ height }}>
        <div className="ds-bubble-chart__rows">
          {showGridLines &&
            Array.from({ length: gridLineCount }, (_, i) => {
              const tick = Math.round((yMax * (gridLineCount - i)) / gridLineCount);
              return (
                <div className="ds-bubble-chart__row" key={i}>
                  {showAxisLabels && (
                    <>
                      <span className="ds-bubble-chart__tick">{tick}</span>
                      <span className="ds-bubble-chart__tick">{tick}</span>
                    </>
                  )}
                </div>
              );
            })}
          <div className="ds-bubble-chart__bubbles">
            {data.map((d, i) => {
              const color = d.color ?? chartColor(i);
              const hovered = hoveredKey === d.label;
              const tooltipPoint = { label: d.label, value: `(${d.x}, ${d.y}) · ${d.size}`, color };
              const size = diameter(d.size);
              return (
                <div
                  key={d.label}
                  className="ds-bubble-chart__bubble"
                  style={{
                    left: `${(d.x / xMax) * 100}%`,
                    top: `${100 - (d.y / yMax) * 100}%`,
                    width: size,
                    height: size,
                    background: hovered ? color : chartColorMuted(color),
                    borderColor: color,
                    animationDelay: `${i * 40}ms`,
                  }}
                  tabIndex={0}
                  role="img"
                  aria-label={`${d.label}: x ${d.x}, y ${d.y}, size ${d.size}`}
                  onMouseEnter={(event: MouseEvent) => showTooltipAtPoint(d.label, event.clientX, event.clientY, tooltipPoint)}
                  onMouseMove={(event: MouseEvent) => showTooltipAtPoint(d.label, event.clientX, event.clientY, tooltipPoint)}
                  onMouseLeave={hideTooltip}
                  onFocus={(event: FocusEvent) => showTooltipAtElement(d.label, event.currentTarget, tooltipPoint)}
                  onBlur={hideTooltip}
                />
              );
            })}
          </div>
        </div>
        <div className="ds-bubble-chart__baseline">
          {showAxisLabels && (
            <>
              <span className="ds-bubble-chart__tick">0</span>
              <span className="ds-bubble-chart__tick">{xMax}</span>
            </>
          )}
        </div>
      </div>
      {showLegend && <ChartLegend items={legendItems} />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
