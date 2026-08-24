import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import "./IconButton.css";

export type IconButtonVariant = "primary" | "secondary" | "ghost" | "accent";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  /**
   * Sized by the caller, not this component — matches `<Button>`'s own
   * `leadingIcon` convention. Figma's confirmed icon size per `size`: 16px
   * for "sm", 24px for "md" and "lg" (Size M's icon was recently increased
   * from 16 to 24, so M and L now share the same icon size and differ only
   * in the surrounding circle's diameter).
   */
  icon: ReactNode;
  /** Required — an icon-only button has no visible label of its own for assistive tech to read. */
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
}

/**
 * A circular, icon-only button — matches Figma's Icon Button exactly across
 * its 4 types × 3 sizes. Figma's own "Tertiary" type is renamed to
 * "secondary" here: it's the identical outlined treatment
 * `<Button variant="secondary">` already has a name for, and Figma's own
 * label would just be a second name for the same visual concept.
 */
export function IconButton({ icon, variant = "primary", size = "md", className, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={clsx("ds-icon-button", `ds-icon-button--${variant}`, `ds-icon-button--${size}`, className)} {...rest}>
      <span className="ds-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
