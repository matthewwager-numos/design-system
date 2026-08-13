import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { clsx } from "clsx";
import "./Badge.css";

export type BadgeStatus = "neutral" | "positive" | "negative" | "notice" | "info" | "complete" | "error";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status color. */
  status?: BadgeStatus;
  /** Badge size. "sm" is a plain dot with no content; "complete"/"error" always render their icon regardless of size (Figma only defines them at "lg"). */
  size?: BadgeSize;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * A status/count indicator. Variants map 1:1 to the Figma component
 * variants (Neutral/Positive/Negative/Notice/Info/Complete/Error); sizes
 * too. Everything else (color, radius, spacing) is driven by tokens.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { status = "neutral", size = "lg", className, children, ...rest },
  ref,
) {
  const icon = status === "complete" ? <CheckIcon /> : status === "error" ? <ErrorIcon /> : null;

  return (
    <span
      ref={ref}
      className={clsx("ds-badge", `ds-badge--${status}`, `ds-badge--${size}`, className)}
      {...rest}
    >
      {icon ? <span className="ds-badge__icon">{icon}</span> : size !== "sm" ? children : null}
    </span>
  );
});
