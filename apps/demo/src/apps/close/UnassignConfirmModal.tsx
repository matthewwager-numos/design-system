import { Button, ButtonGroup, Header, Modal, ModalBody, ModalFooter } from "@numosai/ui";

export interface UnassignConfirmModalProps {
  open: boolean;
  /** How many tasks this applies to — pluralizes the copy for a multi-select bulk move. */
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirms before moving a task back to Backlog — a destructive action, since it clears the assignee (and any review due date) rather than just changing stage, the same "are you sure" treatment `ObjectManagementTab`'s delete confirmation uses. */
export function UnassignConfirmModal({ open, count, onClose, onConfirm }: UnassignConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={(next) => !next && onClose()}>
      <Header variant="modal" title="Move to Backlog?" onClose={onClose} />
      <ModalBody>
        <p style={{ margin: 0 }}>
          {count > 1 ? `${count} tasks will be unassigned` : "This task will be unassigned"} and moved back to Backlog. This can't be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Move to Backlog
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}
