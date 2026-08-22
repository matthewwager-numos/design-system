import { useState } from "react";
import type { FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import {
  Avatar,
  Button,
  DetailHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Modal,
  ModalBody,
  Setting,
  SettingsCard,
  Tab,
  TabList,
  Tabs,
} from "@numosai/ui";
import { DEPARTMENT_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, ROLE_OPTIONS, departmentLabel, roleLabel } from "../../data/employees";
import type { Employee, EmployeeRole, EmploymentType } from "../../data/employees";
import { useEmployees } from "../../data/useEmployees";
import { useToast } from "../../toast/ToastProvider";
import { avatarColorFor } from "../../data/avatarColor";

type DetailTab = "details" | "role" | "access";

export interface EmployeeDetailDrawerProps {
  /** `null` closes the drawer — its own transition still plays out since `<Modal>` stays mounted for that duration. */
  employee: Employee | null;
  onClose: () => void;
  onDelete: (employee: Employee) => void;
}

/**
 * The Object Detail drawer for an Employee — matches Figma's Drawer
 * template (a `<DetailHeader>` — breadcrumb, avatar/title/meta, Actions,
 * tabs — over a `<SettingsCard>` per tab). Tabs mirror `AddEmployeeWizard`'s
 * own steps (Details/Role/Access) field-for-field, and reuse the exact same
 * option lists/label lookups as the wizard and the table — one schema
 * shown three ways, not three independently-maintained copies of it.
 */
export function EmployeeDetailDrawer({ employee, onClose, onDelete }: EmployeeDetailDrawerProps) {
  const { updateEmployee } = useEmployees();
  const showToast = useToast();
  const [tab, setTab] = useState<DetailTab>("details");

  function handleSave(patch: Partial<Employee>, message: string) {
    if (!employee) return;
    updateEmployee(employee.id, patch);
    showToast({ status: "positive", title: message });
  }

  return (
    <Modal variant="drawer" side="right" open={employee !== null} onOpenChange={(open) => !open && onClose()}>
      {employee && (
        <>
          <DetailHeader
            breadcrumb="People"
            title={employee.fullName}
            avatar={<Avatar name={employee.fullName} size="xl" color={avatarColorFor(employee.id)} />}
            meta={[employee.jobTitle, departmentLabel(employee.department), roleLabel(employee.role)].filter(Boolean)}
            onClose={onClose}
            actions={
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="secondary" trailingIcon={<ChevronDown size={16} />}>
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onDelete(employee)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            tabs={
              <Tabs value={tab} onValueChange={(value) => setTab(value as DetailTab)}>
                <TabList>
                  <Tab value="details">Details</Tab>
                  <Tab value="role">Role</Tab>
                  <Tab value="access">Access</Tab>
                </TabList>
              </Tabs>
            }
          />

          <ModalBody>
            {tab === "details" && <DetailsCard employee={employee} onSave={handleSave} />}
            {tab === "role" && <RoleCard employee={employee} onSave={handleSave} />}
            {tab === "access" && <AccessCard employee={employee} onSave={handleSave} />}
          </ModalBody>
        </>
      )}
    </Modal>
  );
}

interface CardProps {
  employee: Employee;
  onSave: (patch: Partial<Employee>, message: string) => void;
}

function DetailsCard({ employee, onSave }: CardProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    onSave(
      {
        fullName: String(data.get("fullName") ?? employee.fullName),
        email: String(data.get("email") ?? employee.email),
        jobTitle: String(data.get("jobTitle") ?? employee.jobTitle),
      },
      "Saved employee details",
    );
  }

  return (
    <SettingsCard title="Details" onSave={handleSubmit}>
      <Setting label="Full name" type="text" name="fullName" value={employee.fullName} />
      <Setting label="Email" type="text" name="email" value={employee.email} />
      <Setting label="Job title" type="text" name="jobTitle" value={employee.jobTitle} />
    </SettingsCard>
  );
}

function RoleCard({ employee, onSave }: CardProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    onSave(
      {
        department: String(data.get("department") ?? employee.department),
        employmentType: (String(data.get("employmentType") ?? employee.employmentType) as EmploymentType) || employee.employmentType,
        role: (String(data.get("role") ?? employee.role) as EmployeeRole) || employee.role,
      },
      "Saved role & department",
    );
  }

  return (
    <SettingsCard title="Role" onSave={handleSubmit}>
      <Setting label="Department" type="select" name="department" value={employee.department} options={DEPARTMENT_OPTIONS} />
      <Setting
        label="Employment type"
        type="segmentedControl"
        name="employmentType"
        value={employee.employmentType}
        options={EMPLOYMENT_TYPE_OPTIONS}
      />
      <Setting label="Role" type="radio" name="role" value={employee.role} options={ROLE_OPTIONS} />
    </SettingsCard>
  );
}

const NOTIFY_OPTIONS = [
  { value: "digest", label: "Weekly digest" },
  { value: "mentions", label: "Mentions" },
];

function AccessCard({ employee, onSave }: CardProps) {
  const notifyValues = [...(employee.notifyDigest ? ["digest"] : []), ...(employee.notifyMentions ? ["mentions"] : [])];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const notify = data.getAll("notify").map(String);
    onSave(
      {
        notifyDigest: notify.includes("digest"),
        notifyMentions: notify.includes("mentions"),
      },
      "Saved notifications",
    );
  }

  return (
    <SettingsCard title="Access" onSave={handleSubmit}>
      <Setting label="Notifications" type="checkbox" name="notify" values={notifyValues} options={NOTIFY_OPTIONS} />
    </SettingsCard>
  );
}
