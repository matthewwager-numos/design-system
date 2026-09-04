import type { ReactNode } from "react";
import { clsx } from "clsx";
import { GrainCorner } from "../GrainCorner";
import "./DisplayMetric.css";

export type DisplayMetricColor = "brand" | "green" | "magenta" | "yellow";

const ACCENT_TOKEN: Record<DisplayMetricColor, string> = {
  brand: "var(--background-brand-base)",
  green: "var(--background-positive-base)",
  magenta: "var(--background-alt-negative-base)",
  yellow: "var(--background-notice-base)",
};

export interface DisplayMetricProps {
  /** The headline figure — e.g. `"$24.2K"`. */
  value: ReactNode;
  /** The label under it — e.g. `"Revenue"`. */
  label: ReactNode;
  /** Defaults to `"green"` (Figma's own default variant). */
  color?: DisplayMetricColor;
  className?: string;
  id?: string;
}

/**
 * A single headline metric on a dark card — matches Figma's DisplayMetric
 * exactly across its 4 accent colors (Brand/Green/Magenta/Yellow), each
 * tinting both the label text and the corner's own dithered glow (see
 * `<GrainCorner>`) from the same token.
 *
 * Always dark, regardless of the app's own light/dark setting — Figma's own
 * instances are dark-mode-only. `data-theme="dark"` forces every token
 * inside to resolve to its dark value no matter the ambient theme, the same
 * mechanism already used to keep a portaled `<DropdownMenuContent>` in
 * whatever theme its trigger is in.
 */
export function DisplayMetric({ value, label, color = "green", className, id }: DisplayMetricProps) {
  const accent = ACCENT_TOKEN[color];
  return (
    <div id={id} data-theme="dark" className={clsx("ds-display-metric", className)}>
      <GrainCorner color={accent} className="ds-display-metric__ornament" />
      <div className="ds-display-metric__content">
        <div className="ds-display-metric__value">{value}</div>
        <div
          className={clsx("ds-display-metric__label", color === "brand" && "ds-display-metric__label--brand")}
          style={{ color: accent }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
