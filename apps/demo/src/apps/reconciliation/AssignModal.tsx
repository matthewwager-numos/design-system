import { useEffect, useState } from "react";
import { Button, ButtonGroup, Header, Modal, ModalBody, ModalFooter, Select } from "@numosai/ui";
import { ASSIGNEES } from "../../data/tasks";

export interface AssignModalProps {
  open: boolean;
  /** How many tasks this assignment applies to — pluralizes the title for a multi-select bulk move. Defaults to 1. */
  count?: number;
  /** Pre-selects the current assignee — set for an in-place reassignment (clicking a card's own avatar), omitted for a first-time assignment out of Backlog. */
  defaultAssignee?: string;
  onClose: () => void;
  onAssign: (assignee: string) => void;
}

const ASSIGNEE_OPTIONS = ASSIGNEES.map((name) => ({ value: name, label: name }));

/** Prompts for an assignee before a task (or a whole multi-selection of tasks) can enter the Assigned column, or to reassign an already-assigned task in place — opened from Backlog's "add person" icon, a card's own avatar, dragging card(s) onto Assigned/In Progress/Reconciled while unassigned, or the table's Status dropdown. Confirming sets the assignee (and, for a first-time assignment, moves the task); canceling leaves it untouched. */
export function AssignModal({ open, count = 1, defaultAssignee, onClose, onAssign }: AssignModalProps) {
  const [assignee, setAssignee] = useState(defaultAssignee ?? "");

  // Re-syncs to the new context every time the modal opens — it stays
  // mounted between uses, so without this a second open (for a different
  // task) would still show whatever was left over from the last one.
  useEffect(() => {
    if (open) setAssignee(defaultAssignee ?? "");
  }, [open, defaultAssignee]);

  function handleSubmit() {
    if (!assignee) return;
    onAssign(assignee);
  }

  const title = defaultAssignee ? "Reassign task" : count > 1 ? `Assign ${count} tasks` : "Assign task";

  return (
    <Modal open={open} onOpenChange={(next) => !next && onClose()}>
      <Header variant="modal" title={title} onClose={onClose} />
      <ModalBody>
        <Select label="Assignee" options={ASSIGNEE_OPTIONS} value={assignee} onChange={setAssignee} placeholder="Choose an assignee" />
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!assignee}>
            {defaultAssignee ? "Reassign" : "Assign"}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}
