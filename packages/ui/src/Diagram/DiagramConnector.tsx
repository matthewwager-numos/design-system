import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import { Badge } from "../Badge";
import type { BadgeStatus } from "../Badge";
import "./DiagramConnector.css";

export type DiagramConnectorVariant = "line" | "corner" | "branch" | "dot";
export type DiagramConnectorRotation = 0 | 90 | 180 | 270;

export interface DiagramConnectorBadge {
  status: BadgeStatus;
  /** Overrides `<Badge>`'s own built-in check/x icon — only meaningful for a status other than `"complete"`/`"error"`, which always show their own icon regardless of this. */
  icon?: ReactNode;
}

export interface DiagramConnectorProps {
  row: number;
  column: number;
  /** Defaults to `"line"`. */
  variant?: DiagramConnectorVariant;
  /**
   * Rotates the base asset clockwise, in degrees. `"line"` is drawn
   * vertically and `"corner"` bottom-to-right at 0 — `"branch"` splits a
   * top-entering line left/right at 0. Rotating reaches every other
   * orientation from that one drawn asset instead of a separate hand-drawn
   * one per direction.
   */
  rotation?: DiagramConnectorRotation;
  /** A dashed line instead of solid — e.g. a conditional/inferred path vs. a confirmed one. No effect on `"dot"`. */
  dashed?: boolean;
  /**
   * An arrowhead at the connector's own forward end (see `rotation`'s own
   * doc for which end that is at 0). Only meaningful for `"line"`/
   * `"corner"` — `"branch"` has two forward ends and `"dot"` has none.
   */
  arrow?: boolean;
  /** A status badge centered on the connector — the same `<Badge>` component/colors used everywhere else in this library, not a one-off. */
  badge?: DiagramConnectorBadge;
  className?: string;
}

// Both point sets describe the arrowhead in "rotation: 0" space, same as
// the paths below — a plain CSS `rotate()` on the whole <svg> carries the
// arrow around with it, rather than needing four hand-computed point sets.
const ARROW_POINTS: Record<"line" | "corner", string> = {
  line: "16,32 11,24 21,24",
  corner: "32,16 24,11 24,21",
};

/**
 * One connecting segment in a flow diagram/schematic — a 1×1 tile on the
 * enclosing `<DiagramGrid>`, drawn as a real SVG line/corner/branch/dot
 * rather than a background-image per combination, so `dashed`/`arrow`/
 * `badge` can layer onto any of the four shapes instead of needing a
 * separate asset for each combination. Stroke color/weight match this
 * app's own hand-built flow connectors (`HomePage.tsx`'s bracket paths) —
 * the same visual language, not a separate one invented for this component.
 *
 * The exact corner/branch geometry is a reasonable, readable line drawing
 * inferred from the reference design's screenshot, not a pixel-traced copy
 * of a confirmed Figma asset — flag it if it reads wrong.
 */
export function DiagramConnector({ row, column, variant = "line", rotation = 0, dashed = false, arrow = false, badge, className }: DiagramConnectorProps) {
  const style: CSSProperties = { gridRow: row, gridColumn: column };
  const pathClassName = clsx("ds-diagram-connector__path", dashed && "ds-diagram-connector__path--dashed");
  const showArrow = arrow && (variant === "line" || variant === "corner");

  return (
    <div className={clsx("ds-diagram-connector", className)} style={style}>
      <svg viewBox="0 0 32 32" className="ds-diagram-connector__svg" style={{ transform: `rotate(${rotation}deg)` }} aria-hidden>
        {variant === "line" && <path d="M16 0 L16 32" className={pathClassName} />}
        {variant === "corner" && <path d="M16 32 L16 24 Q16 16 24 16 L32 16" className={pathClassName} />}
        {variant === "branch" && <path d="M16 0 L16 16 M0 16 L32 16" className={pathClassName} />}
        {variant === "dot" && <circle cx="16" cy="16" r="2" className="ds-diagram-connector__dot" />}
        {showArrow && <polygon points={ARROW_POINTS[variant as "line" | "corner"]} className="ds-diagram-connector__arrow" />}
      </svg>
      {badge ? (
        <Badge status={badge.status} size="md" className="ds-diagram-connector__badge">
          {badge.icon}
        </Badge>
      ) : null}
    </div>
  );
}
