import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import "./DiagramGrid.css";

export interface DiagramGridProps {
  /** Column count — rows grow automatically as content needs them, same as CSS grid's own auto-placement. */
  columns: number;
  /** Both row and column track size. Defaults to 2rem (32px), matching the reference design's own grid. */
  cellSize?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The grid a flow diagram/schematic is built on. `<DiagramNode>`/
 * `<DiagramConnector>` place themselves onto it at an explicit row/column —
 * the same "the consumer supplies the layout, nothing is auto-routed"
 * philosophy `<GanttChart>` already uses (explicit start/end dates, not a
 * computed schedule). A cell with nothing placed in it is just an empty
 * grid cell; there's no separate "blank" tile to render.
 */
export function DiagramGrid({ columns, cellSize = "2rem", children, className }: DiagramGridProps) {
  return (
    <div
      className={clsx("ds-diagram-grid", className)}
      style={{ "--ds-diagram-columns": columns, "--ds-diagram-cell": cellSize } as CSSProperties}
    >
      {children}
    </div>
  );
}
