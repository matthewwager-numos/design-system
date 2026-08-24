import type { FocusEvent, MouseEvent } from "react";
import { clsx } from "clsx";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, chartColorMuted } from "./chartColors";
import { useChartHover } from "./useChartHover";
import "./BarChart.css";

export interface ChartDatum {
  label: string;
  value: number;
  /** Defaults to the palette color at this datum's index. */
  color?: string;
}

export type BarChartOrientation = "vertical" | "horizontal";

export interface BarChartProps {
  data: ChartDatum[];
  /** Confirmed from Figma: both are the same chart, just transposed. */
  orientation?: BarChartOrientation;
  showLegend?: boolean;
  showGridLines?: boolean;
  /** The numeric tick values along the value axis. */
  showAxisLabels?: boolean;
  /** The per-bar category labels (baseline row for vertical, side column for horizontal). */
  showCategoryLabels?: boolean;
  /** Number of gridline divisions along the value axis, not counting the baseline. */
  gridLineCount?: number;
  /** Overall plot height in px (vertical: the value axis; horizontal: the category axis). */
  height?: number;
  className?: string;
}

/**
 * A vertical or horizontal bar chart — matches Figma's Chart component
 * exactly for colors, typography, and grid/baseline treatment. Ticks are
 * real computed values from `data`'s max, not Figma's static "00"
 * placeholders. Hovering (or focusing) a bar shows its value in a tooltip
 * and dims the others to their `chartColorMuted` variant.
 */
export function BarChart({
  data,
  orientation = "vertical",
  showLegend = true,
  showGridLines = true,
  showAxisLabels = true,
  showCategoryLabels = true,
  gridLineCount = 5,
  height = 180,
  className,
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const legendItems = data.map((d, i) => ({ label: d.label, color: d.color ?? chartColor(i) }));
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();

  function barProps(d: ChartDatum, i: number) {
    const color = d.color ?? chartColor(i);
    const background = hoveredKey && hoveredKey !== d.label ? chartColorMuted(color) : color;
    return {
      background,
      tabIndex: 0,
      role: "img" as const,
      "aria-label": `${d.label}: ${d.value}`,
      onMouseEnter: (event: MouseEvent) => showTooltipAtPoint(d.label, event.clientX, event.clientY, { label: d.label, value: String(d.value), color }),
      onMouseMove: (event: MouseEvent) => showTooltipAtPoint(d.label, event.clientX, event.clientY, { label: d.label, value: String(d.value), color }),
      onMouseLeave: hideTooltip,
      onFocus: (event: FocusEvent) => showTooltipAtElement(d.label, event.currentTarget, { label: d.label, value: String(d.value), color }),
      onBlur: hideTooltip,
    };
  }

  return (
    <div className={clsx("ds-bar-chart", `ds-bar-chart--${orientation}`, className)}>
      {orientation === "vertical" ? (
        <div className="ds-bar-chart__grid ds-bar-chart__grid--vertical" style={{ height }}>
          <div className="ds-bar-chart__rows">
            {showGridLines &&
              Array.from({ length: gridLineCount }, (_, i) => {
                const tick = Math.round((max * (gridLineCount - i)) / gridLineCount);
                return (
                  <div className="ds-bar-chart__row" key={i}>
                    {showAxisLabels && (
                      <>
                        <span className="ds-bar-chart__tick">{tick}</span>
                        <span className="ds-bar-chart__tick">{tick}</span>
                      </>
                    )}
                  </div>
                );
              })}
            <div className="ds-bar-chart__bars">
              {data.map((d, i) => {
                const { background, ...rest } = barProps(d, i);
                return (
                  <div className="ds-bar-chart__bar-slot" key={d.label}>
                    <div className="ds-bar-chart__bar" style={{ height: `${(d.value / max) * 100}%`, background }} {...rest} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ds-bar-chart__baseline">
            {showCategoryLabels &&
              data.map((d) => (
                <span className="ds-bar-chart__category" key={d.label}>
                  {d.label}
                </span>
              ))}
          </div>
        </div>
      ) : (
        <div className="ds-bar-chart__grid ds-bar-chart__grid--horizontal" style={{ minHeight: height }}>
          {showCategoryLabels && (
            <div className="ds-bar-chart__category-column">
              {data.map((d) => (
                <span className="ds-bar-chart__category" key={d.label}>
                  {d.label}
                </span>
              ))}
            </div>
          )}
          <div className="ds-bar-chart__columns">
            {showGridLines &&
              Array.from({ length: gridLineCount }, (_, i) => {
                const tick = Math.round((max * (i + 1)) / gridLineCount);
                return (
                  <div className="ds-bar-chart__column" key={i}>
                    {showAxisLabels && (
                      <>
                        <span className="ds-bar-chart__tick">{tick}</span>
                        <span className="ds-bar-chart__tick">{tick}</span>
                      </>
                    )}
                  </div>
                );
              })}
            <div className="ds-bar-chart__bars">
              {data.map((d, i) => {
                const { background, ...rest } = barProps(d, i);
                return (
                  <div className="ds-bar-chart__bar-slot" key={d.label}>
                    <div className="ds-bar-chart__bar" style={{ width: `${(d.value / max) * 100}%`, background }} {...rest} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showLegend && <ChartLegend items={legendItems} />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
