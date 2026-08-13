import type { Meta, StoryObj } from "@storybook/react";
import { AppIcon } from "@numosai/ui";

const APPS = [
  "tasks",
  "accruals",
  "chat",
  "reconciliations",
  "variance",
  "assistant",
  "help-desk",
  "transactions",
  "reports",
  "workflows",
  "settings",
] as const;

const meta: Meta<typeof AppIcon> = {
  title: "Components/AppIcon",
  component: AppIcon,
  // No "autodocs" tag — AppIcon.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    app: {
      control: "select",
      options: APPS,
    },
  },
  args: {
    app: "tasks",
  },
};

export default meta;
type Story = StoryObj<typeof AppIcon>;

export const Default: Story = {};

export const AllApps: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-3)" }}>
      {APPS.map((app) => (
        <div key={app} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)" }}>
          <AppIcon app={app} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--content-subtle)" }}>{app}</span>
        </div>
      ))}
    </div>
  ),
};
