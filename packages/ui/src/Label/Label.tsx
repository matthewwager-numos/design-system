import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import "./Label.css";

export type LabelStatus = "neutral" | "positive" | "negative" | "notice" | "info";
export type LabelSize = "md" | "lg";

export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status color. */
  status?: LabelStatus;
  /** Label size. */
  size?: LabelSize;
  /** Optional icon to render before the text. */
  leadingIcon?: ReactNode;
  /** Optional icon to render after the text. */
  trailingIcon?: ReactNode;
}

/**
 * A status tag/chip. Variants map 1:1 to the Figma component variants
 * (Neutral/Positive/Negative/Notice/Info); sizes too. Everything else
 * (color, radius, spacing, typography) is driven by tokens — the M/L
 * sizes reuse the Paragraph XS/S Regular semantic type styles directly.
 */
export const Label = forwardRef<HTMLSpanElement, LabelProps>(function Label(
  { status = "neutral", size = "md", leadingIcon, trailingIcon, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={clsx("ds-label", `ds-label--${status}`, `ds-label--${size}`, className)}
      {...rest}
    >
      {leadingIcon ? <span className="ds-label__icon" aria-hidden>{leadingIcon}</span> : null}
      <span className="ds-label__text">{children}</span>
      {trailingIcon ? <span className="ds-label__icon" aria-hidden>{trailingIcon}</span> : null}
    </span>
  );
});
