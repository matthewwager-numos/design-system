import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Avatar, Button, ButtonGroup, Cell, Column, Header, Modal, ModalBody, ModalFooter } from "@numosai/ui";
import { useEmployees } from "../../data/useEmployees";
import { useToast } from "../../toast/ToastProvider";
import { avatarColorFor } from "../../data/avatarColor";
import { departmentLabel, employmentTypeLabel, roleLabel } from "../../data/employees";
import type { Employee } from "../../data/employees";
import { EmployeeDetailDrawer } from "./EmployeeDetailDrawer";

export interface ObjectManagementTabProps {
  onAddEmployee: () => void;
}

export function ObjectManagementTab({ onAddEmployee }: ObjectManagementTabProps) {
  const { employees, removeEmployee } = useEmployees();
  // Tracks the id, not the Employee object itself — looking it up fresh
  // from `employees` below means the drawer keeps showing live data after
  // an edit, instead of the stale snapshot captured when the row was
  // clicked.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = employees.find((employee) => employee.id === selectedId) ?? null;
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const showToast = useToast();

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
    <div className="page page--full-width">
      <div className="page__header">
        <p className="page__description">
          {employees.length} {employees.length === 1 ? "person" : "people"}
        </p>
        <Button onClick={onAddEmployee}>Add employee</Button>
      </div>

      {employees.length === 0 ? (
        <p style={{ color: "var(--content-subtle)" }}>No employees yet — add one to get started.</p>
      ) : (
        <>
          <div className="emp-table-wrapper">
            <div
              style={{
                display: "flex",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-l1)",
                overflow: "hidden",
                minWidth: "40rem",
              }}
            >
              <Column header={<Cell type="columnHead">Name</Cell>}>
                {employees.map((employee) => (
                  <Cell
                    key={employee.id}
                    type="avatar"
                    name={employee.fullName}
                    sublabel={employee.jobTitle || undefined}
                    color={avatarColorFor(employee.id)}
                    onClick={() => setSelectedId(employee.id)}
                  >
                    {employee.fullName}
                  </Cell>
                ))}
              </Column>
              <Column header={<Cell type="columnHead">Department</Cell>}>
                {employees.map((employee) => (
                  <Cell key={employee.id} type="text">
                    {employee.department ? departmentLabel(employee.department) : "—"}
                  </Cell>
                ))}
              </Column>
              <Column header={<Cell type="columnHead">Type</Cell>} width={140}>
                {employees.map((employee) => (
                  <Cell key={employee.id} type="label">
                    {employmentTypeLabel(employee.employmentType)}
                  </Cell>
                ))}
              </Column>
              <Column header={<Cell type="columnHead">Role</Cell>} width={100}>
                {employees.map((employee) => (
                  <Cell key={employee.id} type="text">
                    {roleLabel(employee.role)}
                  </Cell>
                ))}
              </Column>
              <Column header={<Cell type="columnHead"> </Cell>} width={56}>
                {employees.map((employee) => (
                  <Cell
                    key={employee.id}
                    type="icon"
                    actions={[{ icon: <Trash2 size={16} />, label: `Delete ${employee.fullName}`, onClick: () => setPendingDelete(employee) }]}
                  />
                ))}
              </Column>
            </div>
          </div>

          <div className="emp-cards">
            {employees.map((employee) => (
              <div key={employee.id} className="emp-card">
                <div className="emp-card__row">
                  <button type="button" className="emp-card__identity-button" onClick={() => setSelectedId(employee.id)}>
                    <Avatar name={employee.fullName} color={avatarColorFor(employee.id)} />
                    <div className="emp-card__identity">
                      <p className="emp-card__name">{employee.fullName}</p>
                      {employee.jobTitle && <p className="emp-card__sublabel">{employee.jobTitle}</p>}
                    </div>
                  </button>
                  <button type="button" className="emp-card__delete" aria-label={`Delete ${employee.fullName}`} onClick={() => setPendingDelete(employee)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <dl className="emp-card__meta">
                  <div>
                    <dt>Department</dt>
                    <dd>{employee.department ? departmentLabel(employee.department) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{employmentTypeLabel(employee.employmentType)}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{roleLabel(employee.role)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </>
      )}

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
