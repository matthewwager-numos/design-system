import { useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { clsx } from "clsx";
import "./AreaChart.css";

export interface AreaChartPoint {
  date: Date;
  value: number;
}

export interface AreaChartProps {
  /** Ordered chronologically. */
  data: AreaChartPoint[];
  /** Formats the big value readout — the last point by default, or the hovered point while hovering. Defaults to `value.toLocaleString()` (no currency symbol — Figma's own "$123,456" is one example, not a hardcoded format). */
  formatValue?: (value: number) => string;
  /** Formats the single centered date shown while hovering — Figma's own example: "Mon Jan 15". */
  formatDate?: (date: Date) => string;
  /** Formats the start/end dates shown at rest — Figma's own example: "Jan 1" / "Jan 31". */
  formatRangeDate?: (date: Date) => string;
  /** The line's stroke color. */
  color?: string;
  /** The area fill beneath the line — a separate, literal token from `color` (confirmed distinct in Figma), not derived from it, so the two can be set independently. */
  fillColor?: string;
  /** Plot height in px. */
  height?: number;
  /** Accessible name for the chart region — describe what it shows (e.g. "Revenue over the last 30 days"), not the word "chart" itself. */
  "aria-label"?: string;
  className?: string;
}

function defaultFormatValue(value: number): string {
  return value.toLocaleString();
}

// "Mon Jan 15" — Intl's own short weekday+month+day formatting inserts a
// comma ("Mon, Jan 15"); Figma's example doesn't have one, so this joins
// the parts itself instead of using that combined format directly.
function defaultFormatDate(date: Date): string {
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  return `${weekday} ${month} ${date.getDate()}`;
}

function defaultFormatRangeDate(date: Date): string {
  const month = date.toLocaleDateString(undefined, { month: "short" });
  return `${month} ${date.getDate()}`;
}

/**
 * A single trend line with an area fill and a continuous hover readout —
 * matches Figma's ChartLineHover exactly (renamed to AreaChart: "area
 * chart" is what this pattern is universally called, and Figma's own name
 * describes the interaction, not the chart type). Colors confirmed via
 * get_variable_defs: the line is `--background-brand-base`, the fill
 * beneath it `--background-brand-subdued`, the top/bottom rules and
 * crosshair `--border-subtle`.
 *
 * "Continuous" is the key difference from `<LineChart>`'s own hover, which
 * only responds to discrete per-point dot targets you have to land on
 * exactly. Here, the whole plot area tracks the pointer continuously and
 * snaps to whichever data point is nearest — the same interaction Apple
 * Stocks/Robinhood-style charts use, no small hit targets required. At
 * rest, the header shows the last point's value and the footer shows the
 * full date range (the "dateline"); while hovering, both switch to the
 * hovered point's own value and date, floating near the crosshair.
 */
export function AreaChart({
  data,
  formatValue = defaultFormatValue,
  formatDate = defaultFormatDate,
  formatRangeDate = defaultFormatRangeDate,
  color = "var(--background-brand-base)",
  fillColor = "var(--background-brand-subdued)",
  height = 160,
  "aria-label": ariaLabel = "Line chart",
  className,
}: AreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  const stepX = data.length > 1 ? 100 / (data.length - 1) : 0;
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = data.map((d, i) => ({ x: i * stepX, y: 100 - ((d.value - min) / range) * 100 }));
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? [`M ${points[0]!.x},100`, ...points.map((p) => `L ${p.x},${p.y}`), `L ${points[points.length - 1]!.x},100`, "Z"].join(" ")
      : "";

  function indexFromClientX(clientX: number): number {
    const el = plotRef.current;
    if (!el || data.length === 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    return Math.min(Math.max(Math.round(ratio * (data.length - 1)), 0), data.length - 1);
  }

  function handleMouseMove(event: MouseEvent) {
    setHoveredIndex(indexFromClientX(event.clientX));
  }

  function handleMouseLeave() {
    setHoveredIndex(null);
  }

  function handleFocus() {
    setHoveredIndex((current) => current ?? data.length - 1);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (data.length === 0) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setHoveredIndex((current) => Math.max((current ?? data.length - 1) - 1, 0));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setHoveredIndex((current) => Math.min((current ?? data.length - 1) + 1, data.length - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setHoveredIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHoveredIndex(data.length - 1);
    }
  }

  const hovered = hoveredIndex !== null ? data[hoveredIndex] : undefined;
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : undefined;
  const lastPoint = data[data.length - 1];
  const displayValue = hovered ?? lastPoint;
  // Keeps the floating value/date labels from running past the plot's own
  // edges — an approximation (half the label's own rendered width isn't
  // known ahead of time), close enough for the short strings these are.
  const floatingLeft = hoveredPoint ? Math.min(Math.max(hoveredPoint.x, 10), 90) : 50;

  return (
    <div className={clsx("ds-area-chart", className)} role="group" aria-label={ariaLabel}>
      <div className="ds-area-chart__header">
        {hovered ? (
          <span className="ds-area-chart__value ds-area-chart__value--floating" style={{ left: `${floatingLeft}%` }} aria-live="polite">
            {displayValue && formatValue(displayValue.value)}
          </span>
        ) : (
          <span className="ds-area-chart__value" aria-live="polite">
            {displayValue && formatValue(displayValue.value)}
          </span>
        )}
      </div>
      <div
        className="ds-area-chart__plot"
        style={{ height }}
        ref={plotRef}
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        <svg className="ds-area-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="ds-area-chart__area" d={areaPath} fill={fillColor} />
          <polyline className="ds-area-chart__line" points={linePoints} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {hoveredPoint && (
          <>
            <div className="ds-area-chart__crosshair" style={{ left: `${hoveredPoint.x}%` }} aria-hidden="true" />
            <div className="ds-area-chart__dot" style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%`, background: color }} aria-hidden="true" />
          </>
        )}
      </div>
      <div className="ds-area-chart__footer">
        {hovered ? (
          <span className="ds-area-chart__date ds-area-chart__date--floating" style={{ left: `${floatingLeft}%` }} aria-live="polite">
            {formatDate(hovered.date)}
          </span>
        ) : (
          <>
            <span className="ds-area-chart__date">{data[0] && formatRangeDate(data[0].date)}</span>
            <span className="ds-area-chart__date">{lastPoint && formatRangeDate(lastPoint.date)}</span>
          </>
        )}
      </div>
    </div>
  );
}
