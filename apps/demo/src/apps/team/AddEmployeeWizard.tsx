import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  SegmentedControl,
  SegmentedControlOption,
  Select,
  TextInput,
  Wizard,
} from "@numosai/ui";
import type { WizardStep } from "@numosai/ui";
import { DEPARTMENT_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, ROLE_OPTIONS } from "../../data/employees";
import type { EmployeeRole, EmploymentType } from "../../data/employees";
import type { NewEmployee } from "../../data/useEmployees";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AddEmployeeWizardProps {
  onFinish: (employee: NewEmployee) => void;
  onCancel: () => void;
}

export function AddEmployeeWizard({ onFinish, onCancel }: AddEmployeeWizardProps) {
  // Real per-field validation, driving TextInput's own defined `status="error"`
  // state — Wizard renders a real `<form>` with `noValidate`, specifically so
  // the browser's native validation tooltip never substitutes for this.
  const [stepIndex, setStepIndex] = useState(0);
  const [fullNameError, setFullNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  function validateFullName(value: string) {
    const error = value.trim() ? undefined : "Full name is required";
    setFullNameError(error);
    return error;
  }

  function validateEmail(value: string) {
    const error = !value.trim() ? "Email is required" : !EMAIL_PATTERN.test(value) ? "Enter a valid email address" : undefined;
    setEmailError(error);
    return error;
  }

  function handleStepIndexChange(next: number) {
    // Only gate moving forward off the Details step — Back/Continue from
    // later steps, and moving backward, are never blocked.
    if (stepIndex === 0 && next > 0) {
      const hasFullNameError = validateFullName(fullNameRef.current?.value ?? "");
      const hasEmailError = validateEmail(emailRef.current?.value ?? "");
      if (hasFullNameError || hasEmailError) return;
    }
    setStepIndex(next);
  }

  const steps: WizardStep[] = [
    {
      id: "details",
      label: "Details",
      heading: "Employee details",
      description: "Basic information used across the rest of the flow.",
      content: (
        <>
          <TextInput
            ref={fullNameRef}
            name="fullName"
            label="Full name"
            size="md"
            placeholder="Jordan Lee"
            required
            status={fullNameError ? "error" : "default"}
            helpText={fullNameError}
            onBlur={(event) => validateFullName(event.target.value)}
          />
          <TextInput
            ref={emailRef}
            name="email"
            label="Email"
            type="email"
            size="md"
            placeholder="jordan@company.com"
            required
            status={emailError ? "error" : "default"}
            helpText={emailError}
            onBlur={(event) => validateEmail(event.target.value)}
          />
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
          <Select name="department" label="Department" size="md" placeholder="Select a department" options={DEPARTMENT_OPTIONS} />
          <RadioGroup name="role" label="Role" defaultValue="member">
            {ROLE_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </RadioGroup>
          <SegmentedControl name="employmentType" defaultValue="fulltime">
            {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
              <SegmentedControlOption key={option.value} value={option.value}>
                {option.label}
              </SegmentedControlOption>
            ))}
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
        </>
      ),
    },
  ];

  function handleFinish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "");
    const email = String(data.get("email") ?? "");

    // Wizard has no per-step validation gate (every step's fields stay
    // mounted in one form), so re-check both here — a field that was never
    // blurred could otherwise slip through to Finish untouched.
    const hasFullNameError = validateFullName(fullName);
    const hasEmailError = validateEmail(email);
    if (hasFullNameError || hasEmailError) {
      // Both fields live on the first step — jump back so their (now set)
      // error state is actually visible, rather than silently refusing to
      // submit while the last step stays on screen.
      setStepIndex(0);
      return;
    }

    const notify = data.getAll("notify").map(String);

    onFinish({
      fullName,
      email,
      jobTitle: String(data.get("jobTitle") ?? ""),
      department: String(data.get("department") ?? ""),
      employmentType: (String(data.get("employmentType") ?? "fulltime") as EmploymentType) || "fulltime",
      role: (String(data.get("role") ?? "member") as EmployeeRole) || "member",
      notifyDigest: notify.includes("digest"),
      notifyMentions: notify.includes("mentions"),
    });
  }

  return (
    <div style={{ height: "100%" }}>
      <Wizard
        title="Add employee"
        steps={steps}
        stepIndex={stepIndex}
        onStepIndexChange={handleStepIndexChange}
        onSaveExit={onCancel}
        onFinish={handleFinish}
        finishLabel="Add employee"
      />
    </div>
  );
}
