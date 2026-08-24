// The five-color categorical palette confirmed via Figma's own Chart
// component (get_variable_defs: "Charts/First" through "Charts/Fifth") —
// series identity, picked by index, not any one series owning a fixed
// meaning. See tokens.css's own "Charts" section.
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]!;
}

/**
 * The de-emphasized variant of a chart color — used whenever hovering one
 * bar/slice/point/ribbon calls for dimming the rest, and for Sankey's
 * default (nothing hovered) ribbon fill. A `color-mix` against the
 * semantic `--chart-*` variable itself, not a blanket CSS `opacity` on the
 * element — same technique already used by tokens.css's own
 * `--shadow-glow-brand`. Always 50%, this codebase's one fixed "lesser
 * opacity" figure rather than a per-callsite magic number.
 */
export function chartColorMuted(color: string): string {
  return `color-mix(in srgb, ${color} 50%, transparent)`;
}
