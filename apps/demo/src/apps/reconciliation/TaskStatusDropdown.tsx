import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Label } from "@numosai/ui";
import type { LabelStatus } from "@numosai/ui";
import { STAGES } from "../../data/tasks";
import type { TaskStage } from "../../data/tasks";

export interface TaskStatusDropdownProps {
  stage: TaskStage;
  onChange: (stage: TaskStage) => void;
}

const STAGE_LABEL_STATUS: Record<TaskStage, LabelStatus> = {
  backlog: "neutral",
  assigned: "info",
  inProgress: "notice",
  inReview: "info",
  reconciled: "positive",
};

/** The table's Status cell — a `<Label>` styled trigger (its own `trailingIcon` slot carries the chevron, not a separate sibling icon) that opens a dropdown of the other stages, so changing status from the table is the same one-step action as dragging a card between kanban columns. Reuses that same `onChange` → gated `moveTask` path, so picking "Assigned"/"In Review" here prompts the same Assign/Review modal a drag would. */
export function TaskStatusDropdown({ stage, onChange }: TaskStatusDropdownProps) {
  return (
    <DropdownMenu size="sm">
      <DropdownMenuTrigger>
        <button type="button" className="tasks-list__status-trigger" onClick={(event) => event.stopPropagation()}>
          <Label status={STAGE_LABEL_STATUS[stage]} size="lg" trailingIcon={<ChevronDown size={12} />}>
            {STAGES.find((s) => s.id === stage)?.label}
          </Label>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {STAGES.map((option) => (
          <DropdownMenuItem key={option.id} active={option.id === stage} onClick={() => onChange(option.id)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
