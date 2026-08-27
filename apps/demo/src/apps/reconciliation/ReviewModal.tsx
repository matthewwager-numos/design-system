import { useEffect, useState } from "react";
import { Button, ButtonGroup, Header, Modal, ModalBody, ModalFooter, Select, TextInput } from "@numosai/ui";
import { ASSIGNEES } from "../../data/tasks";

export interface ReviewModalProps {
  open: boolean;
  /** How many tasks this review applies to — pluralizes the title for a multi-select bulk move. Defaults to 1. */
  count?: number;
  /** Pre-selects the task's current assignee as reviewer — "fine if it's the same user" is the default, not a fresh empty pick. Omitted for a mixed multi-selection with no single current assignee to default to. */
  defaultReviewer?: string;
  onClose: () => void;
  onSubmit: (reviewer: string, dueDate: string) => void;
}

const REVIEWER_OPTIONS = ASSIGNEES.map((name) => ({ value: name, label: name }));

/**
 * Prompts for a reviewer and a review due date before a task (or a whole
 * multi-selection of tasks) can enter the In Review column — opened by
 * dragging card(s) there, or from the table's Status dropdown. Always
 * prompts, regardless of the task's current assignee, since entering
 * review is itself the act of naming who's reviewing it (confirming the
 * same person is a valid, common answer, not a shortcut around asking).
 * Confirming re-assigns every task to the chosen reviewer and sets the due
 * date; canceling leaves them untouched.
 */
export function ReviewModal({ open, count = 1, defaultReviewer, onClose, onSubmit }: ReviewModalProps) {
  const [reviewer, setReviewer] = useState(defaultReviewer ?? "");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (open) {
      setReviewer(defaultReviewer ?? "");
      setDueDate("");
    }
  }, [open, defaultReviewer]);

  function handleSubmit() {
    if (!reviewer || !dueDate) return;
    onSubmit(reviewer, dueDate);
  }

  return (
    <Modal open={open} onOpenChange={(next) => !next && onClose()}>
      <Header variant="modal" title={count > 1 ? `Send ${count} tasks for review` : "Send for review"} onClose={onClose} />
      <ModalBody>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Select label="Reviewer" options={REVIEWER_OPTIONS} value={reviewer} onChange={setReviewer} placeholder="Choose a reviewer" />
          <TextInput label="Review due date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!reviewer || !dueDate}>
            Send for review
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}
