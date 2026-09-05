import { useMemo, useState } from "react";
import { Button, ButtonGroup, Header, Modal, ModalBody, ModalFooter } from "@numosai/ui";
import { HistoryTimeline } from "../../components/HistoryTimeline";
import { RECONCILIATION_HISTORY } from "../../data/reconciliationHistory";
import { useTasks } from "../../data/useTasks";
import { useEmployees } from "../../data/useEmployees";
import { useToast } from "../../toast/ToastProvider";
import type { Employee } from "../../data/employees";
import { EmployeeDetailDrawer } from "../employees/EmployeeDetailDrawer";
import { TaskDetailDrawer } from "./TaskDetailDrawer";

export function HistoryTab() {
  const { tasks, updateTask } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  // Tracks the id, not the Employee object itself — looking it up fresh
  // from `employees` below means the drawer keeps showing live data after
  // an edit, matching `ObjectManagementTab`'s own pattern.
  const { employees, removeEmployee } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId) ?? null;
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const showToast = useToast();

  const entries = useMemo(
    () =>
      RECONCILIATION_HISTORY.map((entry) => ({
        ...entry,
        onSubjectClick: entry.subjectId ? () => setSelectedTaskId(entry.subjectId!) : undefined,
        onActorClick: entry.actorEmployeeId ? () => setSelectedEmployeeId(entry.actorEmployeeId!) : undefined,
      })),
    [],
  );

  function requestDelete(employee: Employee) {
    setSelectedEmployeeId(null);
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

      <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTaskId(null)} onUpdate={updateTask} />
      <EmployeeDetailDrawer employee={selectedEmployee} onClose={() => setSelectedEmployeeId(null)} onDelete={requestDelete} />
    </div>
  );
}
