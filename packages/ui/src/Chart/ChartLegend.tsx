import { clsx } from "clsx";
import "./ChartLegend.css";

export interface ChartLegendItem {
  label: string;
  color: string;
  /**
   * Shown right-aligned on its own row — only meaningful (and only ever
   * passed) for a `"vertical"` legend, matching `<DonutChart>`'s own
   * confirmed key layout (dot + label left, value right). A `"horizontal"`
   * legend never shows this even if provided, since its wrapping row
   * layout has no fixed-width column for a value to align against.
   */
  value?: string;
}

export type ChartLegendOrientation = "horizontal" | "vertical";

export interface ChartLegendProps {
  items: ChartLegendItem[];
  /**
   * Confirmed from Figma: bar/line/sankey use a horizontal, wrapping
   * legend below the chart; the donut uses a narrow vertical stack beside
   * the ring — genuinely different layouts per chart type, not a single
   * style each chart happens to configure differently.
   */
  orientation?: ChartLegendOrientation;
  className?: string;
}

export function ChartLegend({ items, orientation = "horizontal", className }: ChartLegendProps) {
  const showValues = orientation === "vertical";
  return (
    <ul className={clsx("ds-chart-legend", orientation === "vertical" && "ds-chart-legend--vertical", className)}>
      {items.map((item) => (
        <li className="ds-chart-legend__item" key={item.label}>
          <span className="ds-chart-legend__swatch">
            <span className="ds-chart-legend__dot" style={{ background: item.color }} aria-hidden="true" />
            <span className="ds-chart-legend__label">{item.label}</span>
          </span>
          {showValues && item.value !== undefined ? <span className="ds-chart-legend__value">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}
