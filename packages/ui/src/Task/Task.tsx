import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "../Badge";
import { Button } from "../Button";
import "./Task.css";

export type TaskState = "disabled" | "notStarted" | "inProgress" | "overdue" | "complete" | "error";

export interface TaskProps {
  /** Defaults to "notStarted". */
  state?: TaskState;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned label — e.g. "Due in 5d", "1d overdue!", "3d ago", "Locked", or a progress count like "3 of 4 done" for `state="inProgress"`. Free text: the exact wording is the caller's own job, not something this component computes. */
  meta?: ReactNode;
  /** Omit for no action button at all — matches Figma's own "disabled" state, which has none. A common convention: "Start" for notStarted/overdue, "Continue" for inProgress, "Review" for complete, "Fix" for error — but this is plain free text, not hardcoded per state, since callers may want their own wording. */
  actionLabel?: ReactNode;
  onAction?: () => void;
  className?: string;
}

/**
 * The status dot on the left. Reuses `<Badge>` as-is for "complete"/"error"
 * (a real, already-established 24×24 circle with its own check/x icon) —
 * the other states aren't part of Badge's own API (a lock icon for
 * "disabled", or a plain empty circle for "notStarted"/"overdue"/
 * "inProgress" — all three share one look, since what distinguishes them
 * is the meta text/button, not badge color), so those get a small
 * dedicated span here instead of stretching Badge to cover a shape it
 * wasn't built for.
 */
function TaskBadge({ state }: { state: TaskState }) {
  if (state === "complete") return <Badge status="complete" />;
  if (state === "error") return <Badge status="error" />;
  return (
    <span className={clsx("ds-task__badge", `ds-task__badge--${state}`)}>
      {state === "disabled" && <Lock size={16} aria-hidden />}
    </span>
  );
}

/**
 * A single step in a `<TaskList>` — matches Figma's Task component across
 * its states (Disabled/Not started/In progress/Overdue/Complete/Error).
 * Deliberately a plain `<div>`, not a button: Figma's own frame wraps the
 * whole row in one, but it also nests a real "Start"/"Review"/"Fix" button
 * inside — a button can't legally contain another button, so this keeps
 * the one real interactive element (the action button) and drops the
 * outer click target rather than shipping invalid, silently-unnested HTML.
 */
export function Task({ state = "notStarted", title, description, meta, actionLabel, onAction, className }: TaskProps) {
  return (
    <div className={clsx("ds-task", `ds-task--${state}`, className)}>
      <TaskBadge state={state} />
      <div className="ds-task__text">
        <p className="ds-task__title">{title}</p>
        {description ? <p className="ds-task__description">{description}</p> : null}
      </div>
      {meta ? <span className="ds-task__meta">{meta}</span> : null}
      {actionLabel ? (
        <Button variant="secondary" size="sm" onClick={onAction} className="ds-task__action">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
