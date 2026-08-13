import { Fragment } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Badge } from "../Badge";
import { Tooltip } from "../Tooltip";
import "./ProgressIndicator.css";

export type ProgressIndicatorOrientation = "horizontal" | "vertical";
export type ProgressIndicatorStepState = "completed" | "default" | "error";

const BADGE_STATUS = {
  completed: "complete",
  default: "neutral",
  error: "error",
} as const;

export interface ProgressIndicatorStep {
  label: ReactNode;
  /**
   * Defaults to "default" (an upcoming, numbered step). Figma's Progress
   * Step only defines these three states — there's no distinct "current"
   * style, so the step someone's currently on just renders as the next
   * "default" step unless you mark it "completed"/"error" yourself.
   */
  state?: ProgressIndicatorStepState;
}

export interface ProgressIndicatorProps {
  steps: ProgressIndicatorStep[];
  orientation?: ProgressIndicatorOrientation;
  /** Shows each step's label. Only affects `orientation="vertical"` — Figma's horizontal variant never shows labels, just the connected badges. */
  showStepTitle?: boolean;
  /**
   * Shows each step's label in a `<Tooltip>` on hover/focus whenever it
   * isn't already visible as text — always in `orientation="horizontal"`
   * (which never shows labels), and in `orientation="vertical"` only when
   * `showStepTitle` is false. A no-op wherever the label is already
   * visible, since it'd just be redundant. Defaults to true.
   */
  showTooltips?: boolean;
  className?: string;
}

/**
 * A representation of a user's progress through a series of discrete steps
 * — matches Figma's Progress Indicator exactly, including a detail easy to
 * miss from its static frames: the very first step never has a connector
 * leading into it (there's nothing before it), but every step after that
 * does, colored by *that* step's own state — not the one before it. A
 * step's label (vertical only) and the connector leading into the next
 * step both take their color from the step's own `state`.
 *
 * Each step's badge is a real `<Badge>` ("completed" → `status="complete"`,
 * "error" → `status="error"`, "default" → `status="neutral"` showing the
 * step number) rather than a one-off circle — the same component `<Badge>`
 * itself uses for its own Complete/Error icon variants.
 */
export function ProgressIndicator({
  steps,
  orientation = "horizontal",
  showStepTitle = true,
  showTooltips = true,
  className,
}: ProgressIndicatorProps) {
  const labelHidden = orientation === "horizontal" || !showStepTitle;

  return (
    <div className={clsx("ds-progress-indicator", `ds-progress-indicator--${orientation}`, className)}>
      {steps.map((step, index) => {
        const state = step.state ?? "default";
        const isFirst = index === 0;

        const badgeElement = (
          <span className="ds-progress-badge" tabIndex={showTooltips && labelHidden ? 0 : undefined}>
            <Badge status={BADGE_STATUS[state]}>{state === "default" && <span aria-hidden>{index + 1}</span>}</Badge>
            {/* The badge above is decorative — this is what actually tells a
                screen reader each step's status, since Figma's visual-only
                badge doesn't communicate one on its own. */}
            <span className="ds-sr-only">
              Step {index + 1}: {state === "completed" ? "completed" : state === "error" ? "error" : "not started"}
            </span>
          </span>
        );

        const badge =
          showTooltips && labelHidden ? (
            <Tooltip content={step.label} placement={orientation === "vertical" ? "right" : "top"}>
              {badgeElement}
            </Tooltip>
          ) : (
            badgeElement
          );

        if (orientation === "horizontal") {
          return (
            <Fragment key={index}>
              {!isFirst && <span className={clsx("ds-progress-connector", `ds-progress-connector--${state}`)} aria-hidden />}
              {badge}
            </Fragment>
          );
        }

        return (
          <div key={index} className={clsx("ds-progress-step", !isFirst && "ds-progress-step--grow")}>
            <span className="ds-progress-step__track">
              {!isFirst && (
                <span className={clsx("ds-progress-connector", "ds-progress-connector--vertical", `ds-progress-connector--${state}`)} aria-hidden />
              )}
              {badge}
            </span>
            {showStepTitle && <span className={clsx("ds-progress-step__label", `ds-progress-step__label--${state}`)}>{step.label}</span>}
          </div>
        );
      })}
    </div>
  );
}
