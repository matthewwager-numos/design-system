import { Badge, Header, Modal, ModalBody, Setting, SettingsCard } from "@numosai/ui";
import { ASSIGNEES, STAGES, UNASSIGNED } from "../../data/tasks";
import type { Task } from "../../data/tasks";

export interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
}

const ASSIGNEE_OPTIONS = ASSIGNEES.map((name) => ({ value: name, label: name }));

/**
 * Full task details, opened from a card's own id link — a `<Modal
 * variant="drawer">` rather than a new component, since that's exactly
 * Figma's own Drawer type. Stage stays a read-only `<Badge>`: it's driven
 * entirely by the board's own drag/Status-dropdown gating logic elsewhere
 * in `<TasksTab>`, so editing it here would be a backdoor around those
 * rules rather than a real "metadata" edit. Assignee is only editable once
 * a task actually has one — an unassigned Backlog task picks one up via
 * the card's own "add person" icon or a drag, both of which also handle
 * the stage move that comes with it, not this drawer.
 */
export function TaskDetailDrawer({ task, onClose, onUpdate }: TaskDetailDrawerProps) {
  const stage = task ? STAGES.find((s) => s.id === task.stage) : undefined;

  return (
    <Modal variant="drawer" side="right" open={task !== null} onOpenChange={(next) => !next && onClose()}>
      {task ? (
        <>
          <Header variant="modal" title={task.id} onClose={onClose} />
          <ModalBody>
            <div className="drawer-body-stack">
              <Badge status={task.done ? "positive" : "neutral"} size="md">
                {stage?.label}
              </Badge>

              <SettingsCard
                title="Details"
                onSave={(event) => {
                  const formData = new FormData(event.currentTarget);
                  const patch: Partial<Task> = {
                    title: (formData.get("title") as string)?.trim() || task.title,
                    description: ((formData.get("description") as string) ?? task.description).trim(),
                    date: (formData.get("date") as string)?.trim() || task.date,
                  };
                  if (task.assignee !== UNASSIGNED) {
                    const nextAssignee = formData.get("assignee") as string | null;
                    if (nextAssignee) patch.assignee = nextAssignee;
                  }
                  if (task.reviewDueDate) {
                    const nextReviewDue = formData.get("reviewDueDate") as string | null;
                    if (nextReviewDue) patch.reviewDueDate = nextReviewDue;
                  }
                  onUpdate(task.id, patch);
                }}
              >
                <Setting label="Title" name="title" value={task.title} />
                <Setting label="Description" type="textarea" name="description" value={task.description} />
                {task.assignee !== UNASSIGNED ? (
                  <Setting label="Assignee" type="select" name="assignee" value={task.assignee} options={ASSIGNEE_OPTIONS} />
                ) : (
                  <Setting label="Assignee" value="Unassigned" edit={false} />
                )}
                <Setting label={task.done ? "Completed" : "Due"} name="date" value={task.date} />
                {task.reviewDueDate ? <Setting label="Review due" name="reviewDueDate" value={task.reviewDueDate} /> : null}
              </SettingsCard>
            </div>
          </ModalBody>
        </>
      ) : null}
    </Modal>
  );
}
