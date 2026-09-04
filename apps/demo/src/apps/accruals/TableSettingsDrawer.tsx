import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, ButtonGroup, DragList, FieldLabel, Header, Modal, ModalBody, ModalFooter, Setting } from "@numosai/ui";
import type { DragListItem } from "@numosai/ui";
import { ACCRUAL_COLUMNS } from "../../data/accruals";

export interface TableSettingsValues {
  columnIds: string[];
  freezeFirstColumn: boolean;
  groupVendors: boolean;
}

export interface TableSettingsDrawerProps extends TableSettingsValues {
  open: boolean;
  onClose: () => void;
  onSave: (next: TableSettingsValues) => void;
}

/**
 * The Table tab's own settings drawer — a `<Modal variant="drawer">`, same
 * as Figma's own Drawer type. Its Header/Body/Footer are the drawer's own
 * `<Header variant="modal">`/`<ModalBody>`/`<ModalFooter>` directly —
 * *not* a `<SettingsCard>`/`<Form>` nested inside the body, which would
 * draw its own separate card border/shadow floating inside the drawer
 * (confirmed against Figma: the description/Columns/toggles all sit
 * directly on the drawer's own surface, no nested card). This matches how
 * the demo's other confirmation-style modals are built (e.g. the "Delete
 * employee" modal in `ObjectManagementTab`), just with a drawer instead of
 * a centered dialog.
 *
 * Still a real `<form>` (for native `FormData` collection on submit, see
 * below) — `display: contents` keeps it invisible to the flex layout so
 * `<ModalBody>`/`<ModalFooter>` remain direct flex children of `.ds-modal`,
 * exactly as `Modal.css` expects.
 *
 * Columns are reordered/added/removed via `<DragList>`; "Vendor" isn't one
 * of its items since it's the row label column, always shown first and
 * never reorderable or removable.
 *
 * `<Setting type="toggle">` is uncontrolled (matching `<SettingsCard>`'s own
 * form-collects-on-submit convention) — its live value is read via
 * `FormData` on submit, not tracked in React state here. `<Modal>` unmounts
 * its content once the close transition finishes and remounts it fresh
 * next open, so each toggle's `checked` (seeding `defaultChecked`) reliably
 * reflects the latest saved value every time the drawer reopens, with no
 * extra reset needed. `draftColumnIds` is the one piece of real React
 * state here, since `<DragList>` is fully controlled — it's explicitly
 * reset from the saved `columnIds` on open, so a Cancelled drag doesn't
 * linger into the next time the drawer's opened.
 */
export function TableSettingsDrawer({ open, onClose, onSave, columnIds, freezeFirstColumn, groupVendors }: TableSettingsDrawerProps) {
  const [draftColumnIds, setDraftColumnIds] = useState(columnIds);

  useEffect(() => {
    if (open) setDraftColumnIds(columnIds);
  }, [open, columnIds]);

  const items: DragListItem[] = draftColumnIds.map((id) => ({ id, label: ACCRUAL_COLUMNS.find((column) => column.id === id)?.label ?? id }));
  const addOptions = ACCRUAL_COLUMNS.filter((column) => !draftColumnIds.includes(column.id)).map((column) => ({ value: column.id, label: column.label }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSave({
      columnIds: draftColumnIds,
      freezeFirstColumn: formData.get("freezeFirstColumn") === "on",
      groupVendors: formData.get("groupVendors") === "on",
    });
  }

  return (
    <Modal variant="drawer" side="right" open={open} onOpenChange={(next) => !next && onClose()}>
      <Header variant="modal" title="Table Settings" onClose={onClose} />
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <ModalBody>
          <p className="accruals-settings-description">Modify the columns and grouping behavior.</p>

          <FieldLabel as="span">Columns</FieldLabel>
          <DragList
            items={items}
            onReorder={(next) => setDraftColumnIds(next.map((item) => item.id))}
            onRemove={(id) => setDraftColumnIds((prev) => prev.filter((columnId) => columnId !== id))}
            addOptions={addOptions}
            onAddOption={(value) => setDraftColumnIds((prev) => [...prev, value])}
          />

          <Setting label="Freeze first column" type="toggle" edit name="freezeFirstColumn" checked={freezeFirstColumn} />
          <Setting label="Group by vendor" type="toggle" edit name="groupVendors" checked={groupVendors} />
        </ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </ButtonGroup>
        </ModalFooter>
      </form>
    </Modal>
  );
}
