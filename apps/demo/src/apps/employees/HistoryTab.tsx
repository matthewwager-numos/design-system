import { useMemo, useState } from "react";
import { Button, ButtonGroup, Header, Modal, ModalBody, ModalFooter } from "@numosai/ui";
import { HistoryTimeline } from "../../components/HistoryTimeline";
import { EMPLOYEE_HISTORY } from "../../data/employeeHistory";
import { useEmployees } from "../../data/useEmployees";
import { useToast } from "../../toast/ToastProvider";
import type { Employee } from "../../data/employees";
import { EmployeeDetailDrawer } from "./EmployeeDetailDrawer";

export function HistoryTab() {
  const { employees, removeEmployee } = useEmployees();
  // Tracks the id, not the Employee object itself — looking it up fresh
  // from `employees` below means the drawer keeps showing live data after
  // an edit, matching `ObjectManagementTab`'s own pattern.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = employees.find((employee) => employee.id === selectedId) ?? null;
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const showToast = useToast();

  const entries = useMemo(
    () =>
      EMPLOYEE_HISTORY.map((entry) => ({
        ...entry,
        onSubjectClick: entry.subjectId ? () => setSelectedId(entry.subjectId!) : undefined,
        onActorClick: entry.actorEmployeeId ? () => setSelectedId(entry.actorEmployeeId!) : undefined,
      })),
    [],
  );

  function requestDelete(employee: Employee) {
    setSelectedId(null);
    setPendingDelete(employee);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    removeEmployee(pendingDelete.id);
    showToast({ status: "negative", title: `Removed ${pendingDelete.fullName}` });
    setPendingDelete(null);
  }

  return (
    <div className="page page--full-width page--fill-height">
      <HistoryTimeline entries={entries} />

      <Modal open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <Header variant="modal" title="Delete employee" onClose={() => setPendingDelete(null)} />
        <ModalBody>
          <p style={{ margin: 0, font: "var(--type-paragraph-m-regular)", color: "var(--content-base)" }}>
            Remove {pendingDelete?.fullName} from the employee list? This can't be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>

      <EmployeeDetailDrawer employee={selected} onClose={() => setSelectedId(null)} onDelete={requestDelete} />
    </div>
  );
}
