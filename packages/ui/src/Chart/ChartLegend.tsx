import { clsx } from "clsx";
import "./ChartLegend.css";

export interface ChartLegendItem {
  label: string;
  color: string;
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
  return (
    <ul className={clsx("ds-chart-legend", orientation === "vertical" && "ds-chart-legend--vertical", className)}>
      {items.map((item) => (
        <li className="ds-chart-legend__item" key={item.label}>
          <span className="ds-chart-legend__dot" style={{ background: item.color }} aria-hidden="true" />
          <span className="ds-chart-legend__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
