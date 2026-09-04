import { Tooltip } from "../Tooltip";
import type { ChartTooltipData } from "./useChartHover";

export interface ChartTooltipProps {
  data: ChartTooltipData | null;
  visible: boolean;
}

/**
 * The real `<Tooltip>` component, driven entirely by chart hover state
 * instead of its own mouse/focus handling — `open={visible}` makes it fully
 * controlled, and `anchorPoint` tracks the hovered bar/slice/point/ribbon's
 * own coordinates directly rather than `<Tooltip>` measuring a trigger
 * element's box (there isn't a meaningful one here: the point moves on
 * every mousemove, and an SVG shape — DonutChart's segments, SankeyChart's
 * ribbons — nested inside `<Tooltip>`'s own wrapping `<span>` doesn't even
 * render, confirmed empirically). `children` is still required by
 * `<Tooltip>`'s API but otherwise inert here.
 *
 * Wrapped in a `position: absolute` div so this stays out of the flex flow
 * of whichever chart renders it (BarChart/DonutChart/etc. all lay out their
 * own chart/legend with `gap`) — confirmed the hard way that without this,
 * `<Tooltip>`'s own root span, despite being visually empty, still counts
 * as a real flex child the instant `data` goes non-null on first hover,
 * adding one extra `gap` unit to the chart's total height and visibly
 * growing the whole card (and, via `align-items: stretch` on a shared row,
 * even its unhovered siblings) — the "charts jump on hover" bug. The actual
 * tooltip content itself is unaffected either way, since `<Tooltip>`
 * portals it to `document.body` with its own fixed positioning, entirely
 * independent of where this wrapper sits.
 */
export function ChartTooltip({ data, visible }: ChartTooltipProps) {
  if (!data) return null;
  return (
    <div style={{ position: "absolute" }}>
      <Tooltip open={visible} anchorPoint={{ x: data.x, y: data.y }} title={data.label} content={data.value} dotColor={data.color} placement="top">
        <span aria-hidden="true" />
      </Tooltip>
    </div>
  );
}
