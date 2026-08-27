import type { DragEvent } from "react";
import { UserPlus } from "lucide-react";
import { Avatar, Card } from "@numosai/ui";
import { avatarColorFor } from "../../data/avatarColor";
import { UNASSIGNED } from "../../data/tasks";
import type { Task } from "../../data/tasks";

export interface TaskCardProps {
  task: Task;
  /** Real, controlled multi-select state — clicking the card toggles it (see `<Card>`'s own `selected` prop), so several tickets can be selected and moved together in one drag. */
  selected?: boolean;
  onClick?: () => void;
  /** Only relevant for an unassigned task — renders the avatar slot as a clickable "add person" button instead of a plain icon. */
  onAssignClick?: () => void;
  /** Only relevant for an already-assigned task — clicking the avatar reassigns it, in place, without changing stage. */
  onAvatarClick?: () => void;
  /** Opens the full task detail drawer — independent of the card's own onClick. */
  onIdClick?: () => void;
  /** Reports this card's own stage back to the board on drag start/end, so the column it started in can show a "not allowed" cursor instead of a normal drop target. */
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function TaskCard({ task, selected, onClick, onAssignClick, onAvatarClick, onIdClick, onDragStart, onDragEnd }: TaskCardProps) {
  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
    onDragStart?.();
  }

  return (
    <Card
      expand="x"
      selected={selected}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="task-card"
    >
      <div className="task-card__top">
        {task.assignee === UNASSIGNED ? (
          <button
            type="button"
            className="task-card__unassigned"
            aria-label="Assign task"
            onClick={(event) => {
              event.stopPropagation();
              onAssignClick?.();
            }}
          >
            <UserPlus size={16} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="task-card__avatar-button"
            aria-label={`Reassign — currently ${task.assignee}`}
            onClick={(event) => {
              event.stopPropagation();
              onAvatarClick?.();
            }}
          >
            <Avatar name={task.assignee} color={avatarColorFor(task.assignee)} size="sm" />
          </button>
        )}
        <button
          type="button"
          className="task-card__id"
          onClick={(event) => {
            event.stopPropagation();
            onIdClick?.();
          }}
        >
          {task.id}
        </button>
        <span className="task-card__date">
          {task.done ? "Done" : "Due"} {task.date}
        </span>
      </div>
      <p className="task-card__title">{task.title}</p>
      <p className="task-card__description">{task.description}</p>
    </Card>
  );
}
