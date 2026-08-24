import { useState } from "react";

export interface ChartTooltipData {
  x: number;
  y: number;
  label: string;
  value: string;
  color: string;
}

export interface UseChartHoverResult {
  /** Which bar/slice/point/ribbon is currently hovered or focused — components pick their own key shape (an index, a label, a composite link id). */
  hoveredKey: string | null;
  /**
   * Sticky — holds the last hovered point's data even after the pointer
   * leaves, so `<Tooltip>`'s own close-transition still has real content to
   * fade out instead of going blank mid-animation. `tooltipVisible` is the
   * actual show/hide signal.
   */
  tooltip: ChartTooltipData | null;
  tooltipVisible: boolean;
  /** Call from onMouseEnter/onMouseMove with the real cursor position, so the tooltip tracks it. */
  showTooltipAtPoint: (key: string, clientX: number, clientY: number, point: Omit<ChartTooltipData, "x" | "y">) => void;
  /** Call from onFocus (keyboard nav has no cursor position) with the focused element's own rect. */
  showTooltipAtElement: (key: string, target: Element, point: Omit<ChartTooltipData, "x" | "y">) => void;
  hideTooltip: () => void;
}

/**
 * Shared hover/focus + tooltip-position state for BarChart/LineChart/
 * DonutChart/SankeyChart — each renders its own bars/slices/points/ribbons
 * and just wires their mouse/focus handlers through this, so the
 * highlight-hovered/dim-the-rest + follow-the-cursor tooltip behavior stays
 * identical across all four instead of four separate implementations.
 *
 * Positions are viewport (client) coordinates, not chart-relative — the
 * real `<Tooltip>` component (see ChartTooltip.tsx) measures its anchor via
 * `getBoundingClientRect()` same as everywhere else it's used, so there's
 * no chart-root offset math to keep in sync with it.
 */
export function useChartHover(): UseChartHoverResult {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<ChartTooltipData | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  function showTooltipAtPoint(key: string, clientX: number, clientY: number, point: Omit<ChartTooltipData, "x" | "y">) {
    setHoveredKey(key);
    setTooltip({ x: clientX, y: clientY, ...point });
    setTooltipVisible(true);
  }

  function showTooltipAtElement(key: string, target: Element, point: Omit<ChartTooltipData, "x" | "y">) {
    const targetRect = target.getBoundingClientRect();
    showTooltipAtPoint(key, targetRect.left + targetRect.width / 2, targetRect.top, point);
  }

  function hideTooltip() {
    setHoveredKey(null);
    setTooltipVisible(false);
  }

  return { hoveredKey, tooltip, tooltipVisible, showTooltipAtPoint, showTooltipAtElement, hideTooltip };
}
