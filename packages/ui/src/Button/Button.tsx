import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "accent" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: ButtonVariant;
  /** Button size. */
  size?: ButtonSize;
  /** Optional icon to render before the label. */
  leadingIcon?: ReactNode;
  /** Optional icon to render after the label. */
  trailingIcon?: ReactNode;
  /** Stretch to fill the parent's width. */
  fullWidth?: boolean;
}

/**
 * The primary action component. Variants map 1:1 to the Figma component
 * variants (Primary/Secondary/Accent/Destructive/Link); sizes too. Everything
 * else (color, radius, spacing) is driven by tokens — so updating tokens.css
 * restyles every Button automatically.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    fullWidth,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "ds-button",
        `ds-button--${variant}`,
        `ds-button--${size}`,
        fullWidth && "ds-button--full",
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="ds-button__icon" aria-hidden>{leadingIcon}</span> : null}
      <span className="ds-button__label">{children}</span>
      {trailingIcon ? <span className="ds-button__icon" aria-hidden>{trailingIcon}</span> : null}
    </button>
  );
});
