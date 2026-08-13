import { useState } from "react";
import type { FormEvent } from "react";
import { Building2, ChartColumn, LogOut, Settings, Users } from "lucide-react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DropdownMenuItem,
  NavItem,
  NavSection,
  NavUser,
  Navigation,
  Radio,
  RadioGroup,
  SegmentedControl,
  SegmentedControlOption,
  Select,
  TextInput,
  Toggle,
  Wizard,
} from "@numosai/ui";
import type { WizardStep } from "@numosai/ui";
import "./EmployeeWizardPage.css";

const STEPS: WizardStep[] = [
  {
    id: "details",
    label: "Details",
    heading: "Employee details",
    description: "Basic information used across the rest of the flow.",
    content: (
      <>
        <TextInput name="fullName" label="Full name" size="md" placeholder="Jordan Lee" required />
        <TextInput name="email" label="Email" type="email" size="md" placeholder="jordan@company.com" required />
        <TextInput name="jobTitle" label="Job title" size="md" placeholder="Product Designer" />
      </>
    ),
  },
  {
    id: "role",
    label: "Role",
    heading: "Role & department",
    description: "Determines default permissions and where they show up in reports.",
    content: (
      <>
        <Select
          name="department"
          label="Department"
          size="md"
          placeholder="Select a department"
          options={[
            { value: "design", label: "Design" },
            { value: "engineering", label: "Engineering" },
            { value: "sales", label: "Sales" },
            { value: "people", label: "People" },
          ]}
        />
        <RadioGroup name="role" label="Role" defaultValue="member">
          <Radio value="member" label="Member" />
          <Radio value="admin" label="Admin" />
          <Radio value="owner" label="Owner" />
        </RadioGroup>
        <SegmentedControl name="employmentType" defaultValue="fulltime">
          <SegmentedControlOption value="fulltime">Full-time</SegmentedControlOption>
          <SegmentedControlOption value="parttime">Part-time</SegmentedControlOption>
          <SegmentedControlOption value="contract">Contract</SegmentedControlOption>
        </SegmentedControl>
      </>
    ),
  },
  {
    id: "access",
    label: "Access",
    heading: "Notifications & access",
    content: (
      <>
        <CheckboxGroup label="Notifications">
          <Checkbox name="notify" value="digest" label="Weekly digest" defaultChecked />
          <Checkbox name="notify" value="mentions" label="Mentions" defaultChecked />
        </CheckboxGroup>
        <Toggle name="twoFactor" label="Require two-factor authentication" />
      </>
    ),
  },
];

/**
 * The Wizard component next to real app chrome — Navigation is ordinary
 * page chrome the app composes around Wizard, unrelated to wizard
 * progress (that's the header's progress bar + step panel's job
 * entirely). Navigation's own "selected" item just reflects where this
 * page lives in the app (Employees), not which wizard step is current.
 */
export function EmployeeWizardPage() {
  const [created, setCreated] = useState<string | null>(null);

  function handleFinish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setCreated(JSON.stringify(Object.fromEntries(data), null, 2));
  }

  return (
    <div className="ds-wizard-page">
      <Navigation defaultExpanded={false}>
        <NavSection grow>
          <NavItem icon={<Users size={24} />} href="#employees" selected>
            Employees
          </NavItem>
          <NavItem icon={<Building2 size={24} />} href="#departments">
            Departments
          </NavItem>
          <NavItem icon={<ChartColumn size={24} />} href="#reports">
            Reports
          </NavItem>
        </NavSection>
        <NavSection>
          <NavUser name="Maya Chen" initials="MC">
            <DropdownMenuItem leadingIcon={<Settings size={16} />}>Preferences</DropdownMenuItem>
            <DropdownMenuItem leadingIcon={<LogOut size={16} />}>Sign out</DropdownMenuItem>
          </NavUser>
        </NavSection>
      </Navigation>

      {created ? (
        <div className="ds-wizard-page__summary">
          <div className="ds-wizard-page__summary-card">
            <p className="ds-wizard-page__summary-title">Employee added</p>
            <pre className="ds-wizard-page__summary-data">{created}</pre>
            <Button variant="secondary" onClick={() => setCreated(null)}>
              Add another
            </Button>
          </div>
        </div>
      ) : (
        <Wizard title="Add employee" steps={STEPS} onSaveExit={() => setCreated(null)} onFinish={handleFinish} finishLabel="Add employee" />
      )}
    </div>
  );
}
