import { Children, cloneElement, isValidElement, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { clsx } from "clsx";
import type { AvatarProps, AvatarColor } from "../Avatar";
import "./AvatarGroup.css";

export type AvatarGroupOrientation = "horizontal" | "vertical";

const RANDOMIZABLE_COLORS: AvatarColor[] = ["info", "positive", "notice", "negative", "neutral", "alt-negative"];

export interface AvatarGroupProps {
  /** <Avatar> elements. Non-element children (false/null from conditionals) are ignored. */
  children: ReactNode;
  orientation?: AvatarGroupOrientation;
  /** How much each avatar overlaps the previous one, in pixels. */
  overlap?: number;
  /**
   * Assign each avatar a random color from the full status palette, for
   * whichever children don't already set their own `color`. Randomized once
   * per mount (not on every re-render) so avatars don't visibly reshuffle —
   * it's random, not deterministic by name/index, so the same group can look
   * different next time it mounts.
   */
  randomizeColors?: boolean;
  className?: string;
}

/**
 * Lays out a row or column of <Avatar>s with each one overlapping the last.
 * Not a Figma component — a composition helper for the overlapping-avatars
 * pattern Avatar's own ring is designed to support.
 */
export function AvatarGroup({ children, orientation = "horizontal", overlap = 8, randomizeColors = false, className }: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];

  const randomColors = useMemo(
    () => items.map(() => RANDOMIZABLE_COLORS[Math.floor(Math.random() * RANDOMIZABLE_COLORS.length)]),
    // Re-roll only when the number of avatars changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length],
  );

  return (
    <div className={clsx("ds-avatar-group", `ds-avatar-group--${orientation}`, className)}>
      {items.map((child, index) => {
        const offsetStyle =
          index === 0 ? undefined : orientation === "horizontal" ? { marginLeft: -overlap } : { marginTop: -overlap };
        return (
          <span key={child.key ?? index} className="ds-avatar-group__item" style={offsetStyle}>
            {cloneElement(child, {
              color: child.props.color ?? (randomizeColors ? randomColors[index] : undefined),
            })}
          </span>
        );
      })}
    </div>
  );
}
