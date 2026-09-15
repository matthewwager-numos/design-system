import { useState } from "react";
import { Button, ButtonGroup, Header, Modal, ModalBody, ModalFooter, Select, Textarea, TextInput } from "@numosai/ui";
import { ASSIGNEES, UNASSIGNED } from "../../data/tasks";
import type { NewTask } from "../../data/useTasks";

export interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: NewTask) => void;
}

const ASSIGNEE_OPTIONS = [{ value: UNASSIGNED, label: "Unassigned" }, ...ASSIGNEES.map((name) => ({ value: name, label: name }))];

/** Stage isn't a field here — it's derived from whether an assignee was picked: unassigned lands in Backlog, a real assignee skips straight to Assigned, matching how every other task gets there (nothing enters any other column without going through one of those two first). */
export function AddTaskModal({ open, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState(UNASSIGNED);

  function reset() {
    setTitle("");
    setDescription("");
    setAssignee(UNASSIGNED);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      assignee,
      stage: assignee === UNASSIGNED ? "backlog" : "assigned",
      date: "Feb 3",
      done: false,
    });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onOpenChange={(next) => !next && handleClose()}>
      <Header variant="modal" title="Add task" onClose={handleClose} />
      <ModalBody>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <TextInput label="Title" placeholder="e.g. Reconcile January bank statement" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
          <Textarea label="Description" placeholder="What does this task involve?" value={description} onChange={(event) => setDescription(event.target.value)} />
          <Select label="Assignee" options={ASSIGNEE_OPTIONS} value={assignee} onChange={setAssignee} />
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!title.trim()}>
            Add task
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}
