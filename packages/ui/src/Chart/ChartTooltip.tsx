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
 */
export function ChartTooltip({ data, visible }: ChartTooltipProps) {
  if (!data) return null;
  return (
    <Tooltip open={visible} anchorPoint={{ x: data.x, y: data.y }} title={data.label} content={data.value} dotColor={data.color} placement="top">
      <span aria-hidden="true" />
    </Tooltip>
  );
}
