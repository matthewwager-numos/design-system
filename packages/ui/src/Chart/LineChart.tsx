import type { FocusEvent, MouseEvent } from "react";
import { clsx } from "clsx";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, chartColorMuted } from "./chartColors";
import { useChartHover } from "./useChartHover";
import "./LineChart.css";

export interface LineChartSeries {
  label: string;
  /** Aligned by index with `categories`. */
  values: number[];
  /** Defaults to the palette color at this series' index. */
  color?: string;
}

export interface LineChartProps {
  categories: string[];
  series: LineChartSeries[];
  showLegend?: boolean;
  showGridLines?: boolean;
  showAxisLabels?: boolean;
  showCategoryLabels?: boolean;
  /** Number of gridline divisions along the value axis, not counting the baseline. */
  gridLineCount?: number;
  height?: number;
  className?: string;
}

/**
 * A multi-series line chart — same grid/baseline/legend treatment as
 * `<BarChart orientation="vertical">`, confirmed identical in Figma. Figma's
 * own Fever Line instance is a single flattened illustration (not real
 * coordinate data), so the actual line paths here are a genuine renderer
 * built from `series`, not a reproduction of that image. Hovering (or
 * focusing) a point highlights its whole series and shows the point's
 * value in a tooltip, dimming the other series to their `chartColorMuted`
 * variant.
 */
export function LineChart({
  categories,
  series,
  showLegend = true,
  showGridLines = true,
  showAxisLabels = true,
  showCategoryLabels = true,
  gridLineCount = 5,
  height = 180,
  className,
}: LineChartProps) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const legendItems = series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }));
  const stepX = categories.length > 1 ? 100 / (categories.length - 1) : 0;
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();

  return (
    <div className={clsx("ds-line-chart", className)}>
      <div className="ds-line-chart__grid" style={{ height }}>
        <div className="ds-line-chart__rows">
          {showGridLines &&
            Array.from({ length: gridLineCount }, (_, i) => {
              const tick = Math.round((max * (gridLineCount - i)) / gridLineCount);
              return (
                <div className="ds-line-chart__row" key={i}>
                  {showAxisLabels && (
                    <>
                      <span className="ds-line-chart__tick">{tick}</span>
                      <span className="ds-line-chart__tick">{tick}</span>
                    </>
                  )}
                </div>
              );
            })}
          <svg className="ds-line-chart__plot" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {series.map((s, i) => {
              const color = s.color ?? chartColor(i);
              return (
                <polyline
                  key={s.label}
                  points={s.values.map((v, pointIndex) => `${pointIndex * stepX},${100 - (v / max) * 100}`).join(" ")}
                  fill="none"
                  stroke={hoveredKey && hoveredKey !== s.label ? chartColorMuted(color) : color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="ds-line-chart__line"
                />
              );
            })}
          </svg>
          {/* Plain HTML dots, not SVG circles — the plot's viewBox is
              stretched non-uniformly (preserveAspectRatio="none") to fill
              whatever width/height the container ends up with, which would
              squash a real <circle> into an ellipse. Percentage-positioned
              divs with a fixed px size avoid that distortion entirely. */}
          <div className="ds-line-chart__points">
            {series.map((s, i) => {
              const color = s.color ?? chartColor(i);
              const muted = hoveredKey !== null && hoveredKey !== s.label;
              return s.values.map((v, pointIndex) => {
                const key = `${s.label}:${pointIndex}`;
                const tooltipPoint = { label: categories[pointIndex] ?? "", value: `${s.label}: ${v}`, color };
                return (
                  <div
                    key={key}
                    className="ds-line-chart__point"
                    style={{
                      left: `${pointIndex * stepX}%`,
                      top: `${100 - (v / max) * 100}%`,
                      background: muted ? chartColorMuted(color) : color,
                    }}
                    tabIndex={0}
                    role="img"
                    aria-label={`${s.label}, ${categories[pointIndex] ?? ""}: ${v}`}
                    onMouseEnter={(event: MouseEvent) => showTooltipAtPoint(s.label, event.clientX, event.clientY, tooltipPoint)}
                    onMouseMove={(event: MouseEvent) => showTooltipAtPoint(s.label, event.clientX, event.clientY, tooltipPoint)}
                    onMouseLeave={hideTooltip}
                    onFocus={(event: FocusEvent) => showTooltipAtElement(s.label, event.currentTarget, tooltipPoint)}
                    onBlur={hideTooltip}
                  />
                );
              });
            })}
          </div>
        </div>
        <div className="ds-line-chart__baseline">
          {showCategoryLabels &&
            categories.map((label) => (
              <span className="ds-line-chart__category" key={label}>
                {label}
              </span>
            ))}
        </div>
      </div>
      {showLegend && <ChartLegend items={legendItems} />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
