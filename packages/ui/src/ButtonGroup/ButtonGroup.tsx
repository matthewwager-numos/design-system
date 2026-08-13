import type { HTMLAttributes } from "react";
import { clsx } from "clsx";
import "./ButtonGroup.css";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** "horizontal" (default) matches Figma's "Inline"; "vertical" matches "Block" — each button stretches to the group's full width. */
  orientation?: ButtonGroupOrientation;
}

/**
 * A wrapper for multiple, related `<Button>`s — matches Figma's ButtonGroup
 * exactly: it's a layout primitive around real `<Button>` instances, not a
 * styled component of its own, so it composes with any `variant`/`size`.
 */
export function ButtonGroup({ orientation = "horizontal", className, children, ...rest }: ButtonGroupProps) {
  return (
    <div className={clsx("ds-button-group", `ds-button-group--${orientation}`, className)} {...rest}>
      {children}
    </div>
  );
}
