import { useState } from "react";
import { Search } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { MobileAppHeader, Tab } from "@numosai/ui";

const meta: Meta<typeof MobileAppHeader> = {
  title: "Components/MobileAppHeader",
  component: MobileAppHeader,
  // No "autodocs" tag — MobileAppHeader.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof MobileAppHeader>;

const PREVIEW_STYLE = { width: "24rem", maxWidth: "100%" };

function DefaultDemo() {
  const [tab, setTab] = useState("recurring");
  return (
    <div style={PREVIEW_STYLE}>
      <MobileAppHeader icon="accruals" title="Accruals" value={tab} onValueChange={setTab}>
        <Tab value="recurring">Recurring</Tab>
        <Tab value="one-time">One-time</Tab>
        <Tab value="templates">Templates</Tab>
        <Tab value="archived">Archived</Tab>
      </MobileAppHeader>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function WithActionsDemo() {
  const [tab, setTab] = useState("recurring");
  return (
    <div style={PREVIEW_STYLE}>
      <MobileAppHeader
        icon="accruals"
        title="Accruals"
        value={tab}
        onValueChange={setTab}
        actions={
          <button type="button" aria-label="Search" style={{ display: "flex", border: "none", background: "none", color: "var(--content-brand-primary)", cursor: "pointer" }}>
            <Search size={20} />
          </button>
        }
      >
        <Tab value="recurring">Recurring</Tab>
        <Tab value="one-time">One-time</Tab>
      </MobileAppHeader>
    </div>
  );
}

export const WithActions: Story = {
  name: "With an action",
  render: () => <WithActionsDemo />,
};

function OverflowDemo() {
  const [tab, setTab] = useState("tab-1");
  return (
    <div style={PREVIEW_STYLE}>
      <MobileAppHeader icon="reports" title="Reports" value={tab} onValueChange={setTab}>
        {Array.from({ length: 8 }, (_, i) => (
          <Tab key={i} value={`tab-${i + 1}`}>
            Section {i + 1}
          </Tab>
        ))}
      </MobileAppHeader>
    </div>
  );
}

export const Overflow: Story = {
  name: "More tabs than fit (scrolls)",
  render: () => <OverflowDemo />,
};
