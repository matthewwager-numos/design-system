import type { ReactNode } from "react";
import { clsx } from "clsx";
import "./TaskList.css";

export interface TaskListProps {
  /** Heading above the list. Omit both `title` and `description` for no heading block at all — matches Figma's own `heading` boolean. */
  title?: ReactNode;
  description?: ReactNode;
  /** `<Task>` elements. */
  children: ReactNode;
  className?: string;
}

/** A centered heading over a stack of `<Task>` steps — matches Figma's TaskList exactly. */
export function TaskList({ title, description, children, className }: TaskListProps) {
  return (
    <div className={clsx("ds-task-list", className)}>
      {(title || description) && (
        <div className="ds-task-list__heading">
          {title ? <p className="ds-task-list__title">{title}</p> : null}
          {description ? <p className="ds-task-list__description">{description}</p> : null}
        </div>
      )}
      <div className="ds-task-list__items">{children}</div>
    </div>
  );
}
