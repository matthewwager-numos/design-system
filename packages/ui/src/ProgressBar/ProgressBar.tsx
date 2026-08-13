import { useId } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import "./ProgressBar.css";

export type ProgressBarStatus = "positive" | "notice" | "negative" | "info";

export type ProgressBarScaleDirection = "negative-to-positive" | "positive-to-negative";

export type ProgressBarMode = ProgressBarScaleDirection | ProgressBarStatus;

export interface ProgressBarProps {
  /** Current completion, 0–100. Values outside that range are clamped. */
  value: number;
  label?: ReactNode;
  /** Show the "N%" value text. Defaults to true. */
  showValue?: boolean;
  /**
   * How the fill color is chosen:
   * - `"negative-to-positive"` (default) — scaled by `value`: red below 34%,
   *   yellow below 67%, green at 67%+. Matches Figma's own 25/50/75% samples.
   *   Use for a "how healthy/complete is this" meter where higher is better.
   * - `"positive-to-negative"` — the same scale, inverted: green below 34%,
   *   yellow below 67%, red at 67%+. Use when a higher value is worse (error
   *   rate, risk score, storage nearing a limit).
   * - `"info"` / `"positive"` / `"notice"` / `"negative"` — a single fixed
   *   color, ignoring `value` entirely. Use `"info"` for a plain "in
   *   progress, no judgment" bar (a file upload) where the percentage isn't
   *   good or bad; use the others to force a color a scaled mode would
   *   otherwise pick automatically.
   */
  mode?: ProgressBarMode;
  /** Label and value beside the bar in one row, instead of stacked above it. */
  inline?: boolean;
  className?: string;
}

function isScaleDirection(mode: ProgressBarMode): mode is ProgressBarScaleDirection {
  return mode === "negative-to-positive" || mode === "positive-to-negative";
}

function scaledStatus(value: number, inverted: boolean): ProgressBarStatus {
  const high = inverted ? "negative" : "positive";
  const low = inverted ? "positive" : "negative";
  if (value >= 67) return high;
  if (value >= 34) return "notice";
  return low;
}

/**
 * A completion meter. `mode` is either a scale direction (fill color driven
 * by `value`, red/yellow/green in either direction) or one of the four fixed
 * status colors (ignoring `value` entirely). See `mode` for the full
 * breakdown.
 */
export function ProgressBar({ value, label, showValue = true, mode = "negative-to-positive", inline = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const resolvedStatus: ProgressBarStatus = isScaleDirection(mode) ? scaledStatus(clamped, mode === "positive-to-negative") : mode;
  const labelId = useId();

  const labelEl = label ? (
    <span id={labelId} className="ds-progress-bar__label">
      {label}
    </span>
  ) : null;

  const valueEl = showValue ? (
    <span className={clsx("ds-progress-bar__value", clamped > 0 && `ds-progress-bar__value--${resolvedStatus}`)}>
      {clamped}%
    </span>
  ) : null;

  const track = (
    <div className="ds-progress-bar__track">
      <div className={clsx("ds-progress-bar__fill", `ds-progress-bar__fill--${resolvedStatus}`)} style={{ width: `${clamped}%` }} />
    </div>
  );

  return (
    <div
      className={clsx("ds-progress-bar", inline && "ds-progress-bar--inline", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-labelledby={label ? labelId : undefined}
    >
      {inline ? (
        <>
          {labelEl}
          {track}
          {valueEl}
        </>
      ) : (
        <>
          {(labelEl || valueEl) && (
            <div className="ds-progress-bar__row">
              {labelEl}
              {valueEl}
            </div>
          )}
          {track}
        </>
      )}
    </div>
  );
}
