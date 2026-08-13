import { useState } from "react";
import type { FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Checkbox,
  CheckboxGroup,
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

const meta: Meta<typeof Wizard> = {
  title: "Components/Wizard",
  component: Wizard,
  // No "autodocs" tag — Wizard.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Wizard>;

// Wizard is height: 100% of its container — without an explicit height,
// Storybook's Canvas gives it nothing to fill and it collapses to 0.
const PREVIEW_STYLE = { height: "42rem", display: "flex" };

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

function WizardDemo() {
  const [outcome, setOutcome] = useState<string | null>(null);

  function handleFinish(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setOutcome(JSON.stringify(Object.fromEntries(data), null, 2));
  }

  if (outcome) {
    return (
      <div style={{ ...PREVIEW_STYLE, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <pre style={{ padding: "1rem", background: "var(--background-element)", borderRadius: "var(--radius-md)", fontSize: "0.75rem" }}>{outcome}</pre>
      </div>
    );
  }

  return (
    <div style={PREVIEW_STYLE}>
      <Wizard title="Add employee" steps={STEPS} onSaveExit={() => setOutcome("Exited without finishing.")} onFinish={handleFinish} />
    </div>
  );
}

export const Default: Story = {
  render: () => <WizardDemo />,
};

export const PanelCollapsedByDefault: Story = {
  name: "defaultStepPanelExpanded={false}",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Wizard title="Add employee" steps={STEPS} defaultStepPanelExpanded={false} onFinish={() => {}} />
    </div>
  ),
};

export const CustomLabels: Story = {
  name: "nextLabel / finishLabel",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Wizard title="Invite teammate" steps={STEPS} nextLabel="Next step" finishLabel="Send invite" onFinish={() => {}} />
    </div>
  ),
};

// Every other story above lives inside the padded, light/dark split canvas
// every component gets — fine for comparing states, but it caps Wizard to
// PREVIEW_STYLE's fixed height rather than the full viewport it's actually
// meant to fill next to <Navigation>. This story opts out (fullscreen, no
// split) specifically so opening it in its own tab — the icon in
// Storybook's toolbar — shows Wizard at real, full-viewport size.
export const FullViewport: Story = {
  name: "Full viewport (open in new tab)",
  parameters: { layout: "fullscreen", noThemeSplit: true },
  render: () => (
    <div style={{ height: "100vh" }}>
      <Wizard title="Add employee" steps={STEPS} onFinish={() => {}} />
    </div>
  ),
};
