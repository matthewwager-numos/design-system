import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import "./GaugeChart.css";

export type GaugeChartStatus = "positive" | "notice" | "negative" | "info";

export type GaugeChartScaleDirection = "negative-to-positive" | "positive-to-negative";

export type GaugeChartMode = GaugeChartScaleDirection | GaugeChartStatus;

export type GaugeChartSize = "xs" | "sm" | "md" | "xl";

export interface GaugeChartProps {
  /** Current reading, 0–100. Values outside that range are clamped — same as `<ProgressBar>`. */
  value: number;
  /** What this measures (e.g. "CPU usage") — shown as the small caption under the number. */
  label?: ReactNode;
  /** Show the big "N" value and its caption. Defaults to `true` for "md"/"xl", `false` for "sm"/"xs" — matching Figma's own small size, which is a bare colored arc with no readout (too small to fit one legibly). */
  showValue?: boolean;
  /**
   * How the arc's color is chosen — identical logic to `<ProgressBar>`'s own
   * `mode`:
   * - `"negative-to-positive"` (default) — scaled by `value`: red below 34%,
   *   yellow below 67%, green at 67%+. Use for a "how healthy is this"
   *   reading where higher is better.
   * - `"positive-to-negative"` — the same scale, inverted: green below 34%,
   *   yellow below 67%, red at 67%+. Use when a higher reading is worse.
   * - `"info"` / `"positive"` / `"notice"` / `"negative"` — a single fixed
   *   color, ignoring `value` entirely.
   */
  mode?: GaugeChartMode;
  /** Figma defines "sm"/"md"/"xl"; "xs" is an extra, smaller step below "sm" for the same compact glyph-style use. "sm"/"xs" default to hiding the readout (see `showValue`); "md"/"xl" show it, at successively smaller type-ramp sizes than Figma's own fixed "Heading 2XL" the smaller the gauge gets. */
  size?: GaugeChartSize;
  className?: string;
}

// Identical thresholds to <ProgressBar>'s own scaledStatus — see that
// component for the reasoning (Figma's 25/50/75% samples are red/yellow/
// green, not one fixed color).
function isScaleDirection(mode: GaugeChartMode): mode is GaugeChartScaleDirection {
  return mode === "negative-to-positive" || mode === "positive-to-negative";
}

function scaledStatus(value: number, inverted: boolean): GaugeChartStatus {
  const high = inverted ? "negative" : "positive";
  const low = inverted ? "positive" : "negative";
  if (value >= 67) return high;
  if (value >= 34) return "notice";
  return low;
}

const SIZE_DIMENSIONS: Record<GaugeChartSize, number> = {
  xs: 64,
  sm: 96,
  md: 144,
  xl: 192,
};

// 0 = left end of the sweep (value 0), 1 = right end (value 100), tracing
// the top half of the circle — a standard left-to-right speedometer, matching
// the low-value arc confirmed from Figma's own 25%-full example (a small
// segment starting at the left end).
function arcPoint(cx: number, cy: number, radius: number, fraction: number): { x: number; y: number } {
  const angle = Math.PI - fraction * Math.PI;
  return { x: cx + radius * Math.cos(angle), y: cy - radius * Math.sin(angle) };
}

// A real annular wedge (outer arc + inner arc), same technique as
// DonutChart's own donutSlicePath — just swept across 180° instead of 360°.
function gaugeArcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startFraction: number, endFraction: number): string {
  const outerStart = arcPoint(cx, cy, outerRadius, startFraction);
  const outerEnd = arcPoint(cx, cy, outerRadius, endFraction);
  const innerEnd = arcPoint(cx, cy, innerRadius, endFraction);
  const innerStart = arcPoint(cx, cy, innerRadius, startFraction);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/**
 * A half-donut reading with a needle — matches Figma's ChartGage exactly:
 * a muted background-element track, a colored arc filled from 0 to `value`,
 * a needle reaching from the pivot to the arc's own outer edge at that same
 * position, and a center readout (Heading 2XL number + Heading XS caption
 * at "xl", the same typography `<ProgressBar>` already uses for its own
 * label/value — stepping down the same type ramp one size per size step
 * below that). Figma's own S/M sizes are single flattened arcs with no
 * needle or readout (illustrated too small to fit one legibly) — this is
 * the same real, value-driven gauge at every size (including the smaller
 * "xs" this component adds beyond Figma's own three), with `showValue`
 * (identical concept to `<ProgressBar>`'s own prop) defaulting off at
 * "sm"/"xs" to match that look, not a separate, non-functional glyph mode.
 *
 * `mode` is `<ProgressBar>`'s own scaled/fixed system verbatim — confirmed
 * via get_variable_defs that all four of Figma's status colors here
 * (including "Neutral", renamed to `"info"` to match the identical
 * `--background-brand-base` fill `<ProgressBar>` already uses that name
 * for) are the exact same tokens `<ProgressBar>` uses for its own statuses.
 */
export function GaugeChart({ value, label, showValue, mode = "negative-to-positive", size = "xl", className }: GaugeChartProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const resolvedStatus: GaugeChartStatus = isScaleDirection(mode) ? scaledStatus(clamped, mode === "positive-to-negative") : mode;
  const shouldShowValue = showValue ?? (size === "md" || size === "xl");

  const width = SIZE_DIMENSIONS[size];
  const height = width / 2;
  const cx = width / 2;
  const cy = height;
  const outerRadius = height - height * 0.04;
  // Thin enough that the hollow interior comfortably fits the fixed-size
  // readout text without it running into the arc — verified visually, not
  // just computed, since the two live independently (SVG viewBox scaling
  // vs. fixed-px typography).
  const thickness = outerRadius * 0.18;
  const innerRadius = outerRadius - thickness;
  const needle = arcPoint(cx, cy, outerRadius, clamped / 100);
  const pivotRadius = outerRadius * 0.07;
  const viewBoxHeight = height + pivotRadius;
  // Vertically centers the readout within the hollow below the arc's inner
  // edge (from that edge's own peak down to the pivot) — computed from the
  // real geometry above instead of a hardcoded percentage, so it stays
  // correct if the thickness ratio ever changes.
  const readoutTop = ((cy - innerRadius / 2) / viewBoxHeight) * 100;
  const labelId = useId();
  const maskId = useId();
  // Same masked stroke-dasharray/dashoffset "circular progress" reveal as
  // DonutChart's own radial fill, sized to a half circumference instead of
  // a full one — the fill arc only ever spans the top semicircle, so
  // there's nothing to gain from sweeping the (otherwise-empty) bottom
  // half too. `rotate(180 cx cy)` lands the mask circle's own implicit
  // start point (3 o'clock, sweeping clockwise) at 9 o'clock instead,
  // where the gauge's own 0% reading sits — from there, clockwise traces
  // 9 → 12 → 3, i.e. exactly the top semicircle the fill occupies.
  const maskRadius = (innerRadius + outerRadius) / 2;
  const maskStrokeWidth = outerRadius - innerRadius + 2;
  const maskHalfCircumference = Math.PI * maskRadius;
  // The needle is drawn at its real, final angle already (see `needle`
  // above) — the entrance animation rotates it *away* from that position
  // by exactly the angle a 0% reading would sit at, then eases back to 0
  // extra rotation (its own true position), rather than computing a second
  // separate "0%" coordinate to animate between.
  const needleSweepDeg = (clamped / 100) * 180;

  return (
    <div
      className={clsx("ds-gauge-chart", `ds-gauge-chart--${size}`, className)}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-labelledby={label ? labelId : undefined}
    >
      <svg className="ds-gauge-chart__svg" viewBox={`0 0 ${width} ${viewBoxHeight}`}>
        <path className="ds-gauge-chart__track" d={gaugeArcPath(cx, cy, innerRadius, outerRadius, 0, 1)} />
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <circle
              className="ds-gauge-chart__reveal"
              cx={cx}
              cy={cy}
              r={maskRadius}
              fill="none"
              stroke="white"
              strokeWidth={maskStrokeWidth}
              strokeDasharray={maskHalfCircumference}
              transform={`rotate(180 ${cx} ${cy})`}
              style={{ "--ds-gauge-half-circumference": maskHalfCircumference } as CSSProperties}
            />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <path className={clsx("ds-gauge-chart__fill", `ds-gauge-chart__fill--${resolvedStatus}`)} d={gaugeArcPath(cx, cy, innerRadius, outerRadius, 0, clamped / 100)} />
        </g>
      </svg>
      {label && !shouldShowValue && (
        <span id={labelId} className="ds-sr-only">
          {label}
        </span>
      )}
      {shouldShowValue && (
        <div className="ds-gauge-chart__readout" style={{ top: `${readoutTop}%` }}>
          <span className="ds-gauge-chart__value">{clamped}</span>
          {label && (
            <span id={labelId} className="ds-gauge-chart__label">
              {label}
            </span>
          )}
        </div>
      )}
      {/* A separate SVG layered after the readout, not more shapes in the
          one above — the needle needs to paint over the text whenever it
          sweeps up into that area (high values), and SVG/HTML stacking is
          otherwise just DOM order here, not something z-index alone fixes
          across the two. */}
      <svg className="ds-gauge-chart__svg ds-gauge-chart__svg--needle" viewBox={`0 0 ${width} ${viewBoxHeight}`}>
        <line
          className="ds-gauge-chart__needle"
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          style={{ transformOrigin: `${cx}px ${cy}px`, "--ds-gauge-needle-sweep": `${needleSweepDeg}deg` } as CSSProperties}
        />
        <circle className="ds-gauge-chart__pivot" cx={cx} cy={cy} r={pivotRadius} />
      </svg>
    </div>
  );
}
