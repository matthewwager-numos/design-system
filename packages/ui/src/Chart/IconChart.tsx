import type { FocusEvent, MouseEvent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartColor, chartColorMuted } from "./chartColors";
import { useChartHover } from "./useChartHover";
import "./IconChart.css";

export interface IconChartDatum {
  label: string;
  value: number;
  /** Defaults to the palette color at this datum's index. */
  color?: string;
}

export type IconChartOrientation = "horizontal" | "vertical" | "wrap";

/** Lucide icons are drawn on a 16 or 24px grid — anything in between or beyond looks slightly off, so this is a closed choice rather than a free number. */
export type IconChartIconSize = 16 | 24;

interface IconChartBaseProps {
  /** Any lucide-react icon component (or a compatible custom one accepting the same `size`/`color`/`fill` props) — the repeated glyph itself. */
  icon: LucideIcon;
  /** Icon size, in px — 16 or 24 (lucide's own two grid sizes). Defaults to 16. */
  iconSize?: IconChartIconSize;
  /** Gap between icons, in px. Negative values overlap them — e.g. a stacked-coin look. */
  gap?: number;
  /**
   * The icon's own SVG fill, independent of its stroke color (`lucide-react`
   * icons are stroke-only, `fill="none"`, by default). Defaults to a 50%-
   * opacity version of each icon's own resolved stroke color, giving a
   * softer duotone look — pass `"none"` to fall back to a plain outline, or
   * a fixed color to use the same fill for every icon regardless of value.
   */
  fill?: string;
  /**
   * A single fallback color for every icon, for the common single-category
   * chart (rather than setting `color` on that one `data` entry). A
   * per-datum `color` still takes precedence when both are set.
   */
  color?: string;
  /** How many raw units one icon represents — defaults to 1 (`value` itself is the icon count in `"categories"`; purely descriptive, for `unitLabel`, in `"percentage"`, whose icon count is always the fixed grid total instead). */
  unitValue?: number;
  /**
   * The small "icon = N unit" caption shown above the chart (e.g. "= 10
   * people", "= $10K"), rendered with the same icon in a muted color. A
   * function receives the current `unitValue` so its number can't drift out
   * of sync with it — e.g. `(unitValue) => `= ${unitValue} people`` — a
   * plain node also still works for a caption with no such number. Omit for
   * no caption.
   */
  unitLabel?: ReactNode | ((unitValue: number) => ReactNode);
  className?: string;
}

export interface IconChartCategoriesProps extends IconChartBaseProps {
  variant?: "categories";
  data: IconChartDatum[];
  /**
   * "horizontal"/"vertical" give each datum its own row/column (identified
   * by its own label, right next to its icons) — "wrap" instead pours every
   * datum's icons into one shared, wrapping run in sequence, identified by
   * color alone (via the legend below) rather than position, matching
   * Figma's own third reference frame.
   */
  orientation?: IconChartOrientation;
  /**
   * "wrap" only — caps how many icons sit on one line before breaking to
   * the next, laid out as a fixed grid instead of letting the browser break
   * lines whenever it runs out of container width. Omit to keep the
   * free-flowing, container-width-driven wrap.
   */
  maxPerLine?: number;
  /** Defaults to `true` for "wrap" (color is the only thing identifying a datum there) and `false` otherwise (each row/column already carries its own label). */
  showLegend?: boolean;
}

export interface IconChartPercentageProps extends IconChartBaseProps {
  variant: "percentage";
  /** Up to 5 categories read clearly in a fixed grid — more still renders (colors cycle the same five-color palette), but individual slivers get hard to make out. */
  data: IconChartDatum[];
  /** Grid columns — defaults to 10 (a classic 10×10 = 100-icon waffle chart), with rows computed from that so the total is always a multiple of it. */
  columns?: number;
  /** Defaults to `true` — color is the only thing identifying a category here, the same reasoning `orientation="wrap"` defaults it on for. */
  showLegend?: boolean;
}

export type IconChartProps = IconChartCategoriesProps | IconChartPercentageProps;

function isPercentage(props: IconChartProps): props is IconChartPercentageProps {
  return props.variant === "percentage";
}

/**
 * Total time budget (ms) spread across however many icons are on screen for
 * the page-load "appear sequentially" animation — divided by the icon count
 * rather than a fixed per-icon step, so a 5-icon chart and a 100-icon
 * percentage grid both finish their reveal in about the same real time
 * instead of the fixed-step approach taking 20x longer for the larger one.
 */
const ICON_STAGGER_BUDGET_MS = 500;

function iconStaggerDelay(index: number, total: number): string {
  const step = total > 1 ? ICON_STAGGER_BUDGET_MS / total : 0;
  return `${index * step}ms`;
}

/**
 * Divides `total` icons across `data` proportionally to each datum's own
 * share of the whole, largest-remainder method — plain `Math.round` per
 * datum can't be used on its own since independently-rounded shares won't
 * generally add back up to exactly `total` (e.g. three equal thirds of 10
 * rounds to 3+3+3=9, not 10). Flooring every share first and then handing
 * the few leftover icons to whichever data had the largest fractional
 * remainder is the standard fix — the same technique real-world seat-
 * apportionment methods use for the identical rounding problem.
 */
function apportionIcons(data: IconChartDatum[], total: number): number[] {
  const sum = data.reduce((s, d) => s + d.value, 0) || 1;
  const raw = data.map((d) => (d.value / sum) * total);
  const counts = raw.map(Math.floor);
  const allocated = counts.reduce((s, c) => s + c, 0);
  const remainders = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < total - allocated; k++) {
    counts[remainders[k]!.i]!++;
  }
  return counts;
}

/**
 * An icon-multiples ("pictogram"/"isotype") chart — repeats one icon to show
 * quantity, matching Figma's three reference layouts (horizontal rows,
 * vertical columns, and a single wrapping run) plus a fourth variant that
 * divides a fixed grid across up to ~5 categories proportionally, a pie-
 * chart/treemap-style "share of a whole" reading rendered in icons instead
 * of area. Hovering (or focusing) an icon shows its value in a tooltip and
 * dims the rest, the same convention every other chart in this library
 * already uses.
 */
export function IconChart(props: IconChartProps) {
  const { icon: Icon, iconSize = 16, gap = 0, fill, color: fallbackColor, unitValue = 1, unitLabel, className } = props;
  const { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip } = useChartHover();
  const resolvedUnitLabel = typeof unitLabel === "function" ? unitLabel(unitValue) : unitLabel;
  const caption = resolvedUnitLabel && (
    <div className="ds-icon-chart__caption">
      <Icon size={iconSize} color="var(--content-placeholder)" fill={fill ?? chartColorMuted("var(--content-placeholder)")} aria-hidden="true" />
      <span>{resolvedUnitLabel}</span>
    </div>
  );

  if (isPercentage(props)) {
    const { data, columns = 10, showLegend = true } = props;
    const total = columns * columns;
    const sum = data.reduce((s, d) => s + d.value, 0) || 1;
    const counts = apportionIcons(data, total);
    // Flattens [count0, count1, ...] into one array the same length as the
    // grid, each entry naming which datum that cell belongs to — e.g.
    // counts [3, 2] over a 5-icon grid becomes [0, 0, 0, 1, 1].
    const assignment = counts.flatMap((count, i) => Array(count).fill(i));
    const legendItems = data.map((d, i) => {
      const percent = Math.round((d.value / sum) * 100);
      return { label: `${d.label} — ${d.value} (${percent}%)`, color: d.color ?? fallbackColor ?? chartColor(i) };
    });

    function iconProps(d: IconChartDatum, i: number) {
      const color = d.color ?? fallbackColor ?? chartColor(i);
      const resolved = hoveredKey && hoveredKey !== d.label ? chartColorMuted(color) : color;
      const percent = Math.round((d.value / sum) * 100);
      const tooltipPoint = { label: d.label, value: `${d.value} · ${percent}%`, color };
      return {
        color: resolved,
        fill: fill ?? chartColorMuted(resolved),
        tabIndex: 0,
        role: "img" as const,
        "aria-label": `${d.label}: ${d.value} (${percent}%)`,
        onMouseEnter: (event: MouseEvent) => showTooltipAtPoint(d.label, event.clientX, event.clientY, tooltipPoint),
        onMouseMove: (event: MouseEvent) => showTooltipAtPoint(d.label, event.clientX, event.clientY, tooltipPoint),
        onMouseLeave: hideTooltip,
        onFocus: (event: FocusEvent) => showTooltipAtElement(d.label, event.currentTarget, tooltipPoint),
        onBlur: hideTooltip,
      };
    }

    return (
      <div className={clsx("ds-icon-chart", "ds-icon-chart--percentage", className)}>
        {caption}
        <div className="ds-icon-chart__grid" style={{ gridTemplateColumns: `repeat(${columns}, ${iconSize}px)` }}>
          {assignment.map((datumIndex, i) => {
            // `gap`/`grid-gap` reject negative lengths outright (the whole
            // declaration gets dropped), which is exactly what a negative
            // `gap` prop needs to do — so spacing is done with margin
            // instead, applied to every cell but the first of its row/column
            // so it still lands only *between* icons, matching what `gap`
            // itself would have produced for positive values.
            const col = i % columns;
            const row = Math.floor(i / columns);
            return (
              <Icon
                key={i}
                size={iconSize}
                style={{
                  animationDelay: iconStaggerDelay(i, assignment.length),
                  marginInlineStart: col > 0 ? gap : 0,
                  marginBlockStart: row > 0 ? gap : 0,
                }}
                {...iconProps(data[datumIndex]!, datumIndex)}
              />
            );
          })}
        </div>
        {showLegend && <ChartLegend items={legendItems} />}
        <ChartTooltip data={tooltip} visible={tooltipVisible} />
      </div>
    );
  }

  const { data, orientation = "horizontal", maxPerLine, showLegend = orientation === "wrap" } = props;
  const legendItems = data.map((d, i) => ({
    label: `${d.label} — ${d.value}`,
    color: d.color ?? fallbackColor ?? chartColor(i),
  }));

  function iconProps(d: IconChartDatum, i: number) {
    const color = d.color ?? fallbackColor ?? chartColor(i);
    const resolved = hoveredKey && hoveredKey !== d.label ? chartColorMuted(color) : color;
    return {
      color: resolved,
      fill: fill ?? chartColorMuted(resolved),
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

  function iconCount(d: IconChartDatum): number {
    return Math.max(0, Math.round(d.value / unitValue));
  }

  // A running global index per datum (not per-row) so the stagger reads as
  // one continuous wave across the whole chart, whether icons land in
  // separate rows/columns or one shared wrapping run.
  const iconCounts = data.map(iconCount);
  const totalIcons = iconCounts.reduce((sum, count) => sum + count, 0);
  let runningOffset = 0;
  const iconOffsets = iconCounts.map((count) => {
    const offset = runningOffset;
    runningOffset += count;
    return offset;
  });

  return (
    <div className={clsx("ds-icon-chart", `ds-icon-chart--${orientation}`, className)}>
      {caption}
      {orientation === "wrap" ? (
        <div
          className="ds-icon-chart__wrap"
          style={
            maxPerLine
              ? // A fixed number per line is a deterministic grid, not the
                // browser's own container-width-driven wrap — `gap` still
                // can't go negative here either, so it's margin (below) for
                // both axes, computed from each cell's row/column.
                { display: "grid", gridTemplateColumns: `repeat(${maxPerLine}, ${iconSize}px)` }
              : { gap: gap >= 0 ? gap : 0 }
          }
        >
          {data.map((d, i) =>
            Array.from({ length: iconCounts[i]! }, (_, iconIndex) => {
              const globalIndex = iconOffsets[i]! + iconIndex;
              const col = maxPerLine ? globalIndex % maxPerLine : globalIndex;
              const row = maxPerLine ? Math.floor(globalIndex / maxPerLine) : 0;
              return (
                <Icon
                  key={`${d.label}:${iconIndex}`}
                  size={iconSize}
                  style={{
                    animationDelay: iconStaggerDelay(globalIndex, totalIcons),
                    marginInlineStart: maxPerLine ? (col > 0 ? gap : 0) : gap < 0 && globalIndex > 0 ? gap : 0,
                    marginBlockStart: maxPerLine && row > 0 ? gap : 0,
                  }}
                  {...iconProps(d, i)}
                />
              );
            }),
          )}
        </div>
      ) : (
        <div className="ds-icon-chart__groups">
          {data.map((d, i) => (
            <div className="ds-icon-chart__group" key={d.label}>
              <span className="ds-icon-chart__label">{d.label}</span>
              <div className="ds-icon-chart__icons">
                {Array.from({ length: iconCounts[i]! }, (_, iconIndex) => {
                  // A vertical column reads as a stack building upward, so
                  // its base (the last DOM child, per `flex-direction:
                  // column`) should animate first — reverse the local delay
                  // order rather than the horizontal/wrap reading order.
                  const delayIndex = orientation === "vertical" ? iconCounts[i]! - 1 - iconIndex : iconIndex;
                  return (
                    <Icon
                      key={iconIndex}
                      size={iconSize}
                      style={{
                        animationDelay: iconStaggerDelay(iconOffsets[i]! + delayIndex, totalIcons),
                        ...(orientation === "vertical"
                          ? { marginBlockStart: iconIndex > 0 ? gap : 0 }
                          : { marginInlineStart: iconIndex > 0 ? gap : 0 }),
                      }}
                      {...iconProps(d, i)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {showLegend && <ChartLegend items={legendItems} />}
      <ChartTooltip data={tooltip} visible={tooltipVisible} />
    </div>
  );
}
