import type { MouseEvent, ReactNode } from "react";
import { clsx } from "clsx";
import "./DiagramNode.css";

export interface DiagramNodeProps {
  /** 1-indexed, matching CSS grid's own row/column-line numbering. */
  row: number;
  column: number;
  /** How many cells this node spans — most nodes are 1×1, but a wider block (e.g. a labeled subsystem) can span more. */
  rowSpan?: number;
  columnSpan?: number;
  /**
   * An icon, an `<Avatar>`, an `<img>`, or any custom content, centered in
   * the tile — this is deliberately a plain slot, not a closed set of typed
   * variants, since a real diagram's nodes end up being a real mix of all
   * of those. Leave empty for a structural placeholder: some layouts need
   * an occupied cell with nothing in it, just to keep a neighboring
   * connector's grid math lined up.
   */
  children?: ReactNode;
  /**
   * Draws this node's own background tile (the rounded square a plain icon
   * needs, since an icon has no box of its own). Turn off for content that
   * already draws its own — e.g. an `<Avatar type="entity">` — so it
   * doesn't sit inside a second, redundant background square. Defaults to
   * `true`.
   */
  tile?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * One block in a flow diagram/schematic — matches the reference design's
 * own node tile (a 1×1 cell, `background-element`, a small radius) placed
 * at an explicit `row`/`column` on the enclosing `<DiagramGrid>`. Renders
 * as a real `<button>` when `onClick` is given (matching every other
 * clickable tile in this library, e.g. `<NavItem>`), otherwise a plain
 * `<div>` — a diagram node is exactly as often a static label as it is a
 * "click to open this record" entry point.
 */
export function DiagramNode({
  row,
  column,
  rowSpan = 1,
  columnSpan = 1,
  children,
  tile = true,
  onClick,
  "aria-label": ariaLabel,
  className,
}: DiagramNodeProps) {
  const style = {
    gridRow: `${row} / span ${rowSpan}`,
    gridColumn: `${column} / span ${columnSpan}`,
  };
  const rootClassName = clsx("ds-diagram-node", tile && "ds-diagram-node--tile", className);

  if (onClick) {
    return (
      <button type="button" className={rootClassName} style={style} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </button>
    );
  }

  return (
    <div className={rootClassName} style={style} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
