import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { clsx } from "clsx";
import "./Badge.css";

export type BadgeStatus = "neutral" | "positive" | "negative" | "notice" | "info" | "complete" | "error";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status color. */
  status?: BadgeStatus;
  /**
   * Badge size. "sm" is a plain dot with no content. "complete"/"error"
   * always render their own icon regardless of size; "notice" only does at
   * "md" — everything else about a plain-color status (children/dot) is
   * unaffected. See `statusIcon` below for which icon each size gets.
   */
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
 * Figma originally only defined "complete"/"error" at "lg" — a plain
 * check/x (above) composited onto a separately-colored circle. "md" was
 * confirmed later, and swaps in Lucide's own `circle-check`/`circle-x`/
 * `circle-alert` glyphs instead: at 16px, the icon's own drawn circle can
 * just BE the badge's edge (sized to fill it exactly — see Badge.css),
 * which reads cleaner than gluing two circles together at that size. "md"
 * is also the first size "notice" gets a forced icon at all — "sm"/"lg"
 * notice is still a plain-color status like positive/negative/info.
 */
function statusIcon(status: BadgeStatus, size: BadgeSize): ReactNode | null {
  if (size === "md") {
    if (status === "complete") return <CircleCheck aria-hidden />;
    if (status === "error") return <CircleX aria-hidden />;
    if (status === "notice") return <CircleAlert aria-hidden />;
    return null;
  }
  if (status === "complete") return <CheckIcon />;
  if (status === "error") return <ErrorIcon />;
  return null;
}

/**
 * A status/count indicator. Variants map 1:1 to the Figma component
 * variants (Neutral/Positive/Negative/Notice/Info/Complete/Error); sizes
 * too. Everything else (color, radius, spacing) is driven by tokens.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { status = "neutral", size = "lg", className, children, ...rest },
  ref,
) {
  const icon = statusIcon(status, size);

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
