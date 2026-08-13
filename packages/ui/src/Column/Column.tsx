import type { ReactNode } from "react";
import { clsx } from "clsx";
import "./Column.css";

export interface ColumnProps {
  /** The header `<Cell type="columnHead" | "sorted" | "checkboxColumnHead">`. */
  header: ReactNode;
  /** The body `<Cell>`s, one per row. */
  children: ReactNode;
  /** Column width — any CSS length, or a bare number of pixels. Defaults to flexible (fills available space, matching its neighbors). */
  width?: number | string;
  className?: string;
}

/**
 * One column of a table: a header cell above a stack of body cells —
 * matches Figma's Column exactly. A pure layout wrapper, not a styled
 * component of its own — every visual detail (background, row dividers,
 * header shading) already belongs to `<Cell>` itself, the same
 * "`<ButtonGroup>` around real `<Button>`s" relationship as elsewhere in
 * this library. `<Column>` only arranges cells vertically and gives them
 * a shared width.
 */
export function Column({ header, children, width, className }: ColumnProps) {
  const style =
    width !== undefined
      ? { flex: `0 0 ${typeof width === "number" ? `${width}px` : width}` }
      : undefined;

  return (
    <div className={clsx("ds-column", className)} style={style}>
      {header}
      {children}
    </div>
  );
}
