import type { FocusEvent, MouseEvent } from "react";
import { clsx } from "clsx";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, chartColorMuted } from "./chartColors";
import { useChartHover } from "./useChartHover";
import "./BarChart.css";

/**
 * Rounds a data max up to a "nice" axis ceiling — evenly divisible by
 * `tickCount` (this chart always renders exactly that many gridline
 * divisions), with each resulting tick itself a round number (1, 2, 5, or
 * 10 × a power of ten), not just any multiple of `tickCount`. A plain
 * "round up to the next multiple of `tickCount`" would turn 83 into 85
 * (5 subdivisions) — technically a multiple of 5, but not a number anyone
 * would actually choose for an axis. This is the standard technique for
 * that (Heckbert's "nice numbers" algorithm, the same approach D3/Chart.js
 * use for axis ticks), applied to the per-tick *step* rather than the
 * overall range, then multiplied back out by `tickCount` — which is what
 * guarantees exactly `tickCount` divisions rather than the "however many
 * ticks happen to fit" result the algorithm's own textbook form produces.
 *
 * The step itself is never allowed below 1: displayed tick values are
 * always whole numbers (`Math.round`, below), so a sub-1 step — e.g. 0.5,
 * the "nice" answer for a max of 2 over 5 ticks — doesn't buy any real
 * precision, it just rounds two distinct ticks (1.5 and 2.0) down to the
 * same displayed "2", producing duplicate labels. Flooring the step at 1
 * means a small integer max like 2 gets a 1-5 axis (step 1) instead.
 */
function niceAxisMax(maxValue: number, tickCount: number): number {
  const rawStep = maxValue / tickCount;
  const exponent = Math.floor(Math.log10(rawStep));
  const magnitude = 10 ** exponent;
  const fraction = rawStep / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  const niceStep = Math.max(1, niceFraction * magnitude);
  return niceStep * tickCount;
}

export interface ChartDatum {
  label: string;
  value: number;
  /** Defaults to the palette color at this datum's index. */
  color?: string;
}

export interface ChartSeries {
  /** Matches a key in every `GroupedChartDatum.values` — identifies which value belongs to this series within each group. */
  key: string;
  label: string;
  /** Defaults to the palette color at this series' index. */
  color?: string;
}

export interface GroupedChartDatum {
  /** The category this group of bars sits under (e.g. a month) — rendered as its axis label, same role as `ChartDatum.label` for the single-bar variant. */
  category: string;
  /** One value per series, keyed by `ChartSeries.key`. Missing keys default to 0. */
  values: Record<string, number>;
}

export type BarChartOrientation = "vertical" | "horizontal";
export type BarChartVariant = "single" | "clustered" | "stacked";

interface BarChartBaseProps {
  /**
   * "single" (default) is one bar per labeled category — `showLegend`
   * defaults to `false` there, since a legend would just repeat names
   * already sitting next to each bar. "clustered"/"stacked" instead group
   * several *series* under one shared category (e.g. several products'
   * values within each month) — the axis labels that shared category, not
   * each individual bar, so a legend is what actually identifies which
   * color is which; `showLegend` defaults to `true` for both.
   */
  variant?: BarChartVariant;
  showLegend?: boolean;
  showGridLines?: boolean;
  /** The numeric tick values along the value axis. */
  showAxisLabels?: boolean;
  /** The per-group category labels (baseline row for vertical, side column for horizontal). */
  showCategoryLabels?: boolean;
  /**
   * Number of gridline divisions along the value axis, not counting the
   * baseline — also what the axis' own ceiling is computed against (see
   * `niceAxisMax`): the tallest bar's real value gets rounded up to
   * whatever nice, evenly-`gridLineCount`-divisible number is just past
   * it, so the axis never ends at an arbitrary value like the data's own
   * raw max.
   */
  gridLineCount?: number;
  /** Overall plot height in px (vertical: the value axis; horizontal: the category axis). */
  height?: number;
  className?: string;
}

export interface SingleBarChartProps extends BarChartBaseProps {
  variant?: "single";
  /** Confirmed from Figma: both are the same chart, just transposed. */
  orientation?: BarChartOrientation;
  data: ChartDatum[];
}

export interface GroupedBarChartProps extends BarChartBaseProps {
  variant: "clustered" | "stacked";
  data: GroupedChartDatum[];
  series: ChartSeries[];
}

export type BarChartProps = SingleBarChartProps | GroupedBarChartProps;

// An explicit type guard, not an inline `props.variant === "clustered" ||
// props.variant === "stacked"` check — `variant` being optional on
// `SingleBarChartProps` (vs. required on `GroupedBarChartProps`) was
// enough to keep TypeScript from narrowing `props` itself back down after
// the check, even though the check was written directly against
// `props.variant`. Spelling out the predicate's return type here forces
// the narrowing explicitly instead of relying on inference that wasn't
// kicking in.
function isGrouped(props: BarChartProps): props is GroupedBarChartProps {
  return props.variant === "clustered" || props.variant === "stacked";
}

// A light stagger on the page-load grow-in animation (see BarChart.css) —
// bars building up in sequence reads as more alive than every bar popping
// in at the exact same instant. `animationDelay` alone, not baked into the
// keyframes themselves, since it needs a different value per bar.
const BAR_STAGGER_MS = 40;

function staggerDelay(index: number): string {
  return `${index * BAR_STAGGER_MS}ms`;
}

// Stacked segments need a *fully sequential* delay instead — each one's
// `transform-origin: bottom` is anchored to its own static resting slot,
// not to the segment below it, so if two segments grow at overlapping
// times, the upper one visually floats above an incomplete stack instead
// of appearing to sit on it. Waiting for the full animation duration
// before starting the next segment (rather than the light 40ms stagger
// above) means each one is only ever growing once everything below it has
// already settled into place — matches --duration-slow (the duration half
// of --motion-enter-slow, which can't be pulled apart in a calc() since
// it's a bundled duration+easing shorthand) so segment *n* starts exactly
// as segment *n-1* finishes, with no gap and no overlap.
const STACK_SEGMENT_STAGGER_MS = 400;

function stackSegmentDelay(index: number): string {
  return `${index * STACK_SEGMENT_STAGGER_MS}ms`;
}

/**
 * A vertical or horizontal bar chart — matches Figma's Chart component
 * exactly for colors, typography, and grid/baseline treatment. Ticks are
 * real computed values from `data`'s max, not Figma's static "00"
 * placeholders. Hovering (or focusing) a bar shows its value in a tooltip
 * and dims the others to their `chartColorMuted` variant.
 *
 * "clustered" (grouped bars side by side) and "stacked" (segments stacked
 * into one bar) are vertical-only for now — Figma's own reference only
 * designed that orientation for these two variants, so a horizontal
 * transposition isn't included rather than invented.
 */
export function BarChart(props: BarChartProps) {
  const { showGridLines = true, showAxisLabels = true, showCategoryLabels = true, gridLineCount = 5, height = 180, className } = props;
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();

  // Checking `props.variant` directly (not a derived local) is what lets
  // TypeScript narrow `props` itself to `GroupedBarChartProps` below —
  // narrowing follows the discriminant property being checked in place,
  // not a copy of its value.
  if (isGrouped(props)) {
    return (
      <GroupedBarChart
        variant={props.variant}
        data={props.data}
        series={props.series}
        showLegend={props.showLegend ?? true}
        showGridLines={showGridLines}
        showAxisLabels={showAxisLabels}
        showCategoryLabels={showCategoryLabels}
        gridLineCount={gridLineCount}
        height={height}
        className={className}
        hover={{ hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip }}
      />
    );
  }

  const { data, orientation = "vertical" } = props;
  const showLegend = props.showLegend ?? false;
  const max = niceAxisMax(Math.max(1, ...data.map((d) => d.value)), gridLineCount);
  const legendItems = data.map((d, i) => ({ label: d.label, color: d.color ?? chartColor(i) }));

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
                    <div
                      className="ds-bar-chart__bar"
                      style={{ height: `${(d.value / max) * 100}%`, background, animationDelay: staggerDelay(i) }}
                      {...rest}
                    />
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
                    <div
                      className="ds-bar-chart__bar"
                      style={{ width: `${(d.value / max) * 100}%`, background, animationDelay: staggerDelay(i) }}
                      {...rest}
                    />
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

interface GroupedBarChartComponentProps
  extends Required<Pick<BarChartBaseProps, "showLegend" | "showGridLines" | "showAxisLabels" | "showCategoryLabels" | "gridLineCount" | "height">> {
  variant: "clustered" | "stacked";
  data: GroupedChartDatum[];
  series: ChartSeries[];
  className?: string;
  hover: ReturnType<typeof useChartHover>;
}

function GroupedBarChart({
  variant,
  data,
  series,
  showLegend,
  showGridLines,
  showAxisLabels,
  showCategoryLabels,
  gridLineCount,
  height,
  className,
  hover: { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip },
}: GroupedBarChartComponentProps) {
  const rawMax =
    variant === "stacked"
      ? Math.max(1, ...data.map((g) => series.reduce((sum, s) => sum + (g.values[s.key] ?? 0), 0)))
      : Math.max(1, ...data.flatMap((g) => series.map((s) => g.values[s.key] ?? 0)));
  const max = niceAxisMax(rawMax, gridLineCount);
  const legendItems = series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }));

  function segmentProps(category: string, s: ChartSeries, i: number, value: number) {
    const color = s.color ?? chartColor(i);
    const key = `${category}::${s.key}`;
    const background = hoveredKey && hoveredKey !== key ? chartColorMuted(color) : color;
    return {
      background,
      tabIndex: 0,
      role: "img" as const,
      "aria-label": `${category} — ${s.label}: ${value}`,
      onMouseEnter: (event: MouseEvent) => showTooltipAtPoint(key, event.clientX, event.clientY, { label: `${category} — ${s.label}`, value: String(value), color }),
      onMouseMove: (event: MouseEvent) => showTooltipAtPoint(key, event.clientX, event.clientY, { label: `${category} — ${s.label}`, value: String(value), color }),
      onMouseLeave: hideTooltip,
      onFocus: (event: FocusEvent) => showTooltipAtElement(key, event.currentTarget, { label: `${category} — ${s.label}`, value: String(value), color }),
      onBlur: hideTooltip,
    };
  }

  return (
    <div className={clsx("ds-bar-chart", `ds-bar-chart--${variant}`, className)}>
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
            {data.map((group) => (
              <div className="ds-bar-chart__bar-slot" key={group.category}>
                {variant === "clustered" ? (
                  <div className="ds-bar-chart__cluster">
                    {series.map((s, i) => {
                      const value = group.values[s.key] ?? 0;
                      const { background, ...rest } = segmentProps(group.category, s, i, value);
                      return (
                        <div
                          className="ds-bar-chart__bar--clustered"
                          key={s.key}
                          style={{ height: `${(value / max) * 100}%`, background, animationDelay: staggerDelay(i) }}
                          {...rest}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="ds-bar-chart__stack">
                    {series.map((s, i) => {
                      const value = group.values[s.key] ?? 0;
                      const { background, ...rest } = segmentProps(group.category, s, i, value);
                      return (
                        <div
                          className="ds-bar-chart__segment"
                          key={s.key}
                          style={{ height: `${(value / max) * 100}%`, background, animationDelay: stackSegmentDelay(i) }}
                          {...rest}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="ds-bar-chart__baseline">
          {showCategoryLabels &&
            data.map((group) => (
              <span className="ds-bar-chart__category" key={group.category}>
                {group.category}
              </span>
            ))}
        </div>
      </div>
      {showLegend && <ChartLegend items={legendItems} />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
