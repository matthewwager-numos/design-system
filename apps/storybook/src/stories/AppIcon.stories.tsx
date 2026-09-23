import type { Meta, StoryObj } from "@storybook/react";
import { AppIcon } from "@numosai/ui";

const APPS = [
  "collect",
  "pay",
  "accruals",
  "reconcile",
  "close",
  "analyze",
  "forecast",
  "communicate",
  "team",
  "notifications",
  "settings",
  "assistant",
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
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    app: "collect",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof AppIcon>;

export const Default: Story = {};

export const AllApps: Story = {
  render: (args) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-3)" }}>
      {APPS.map((app) => (
        <div key={app} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)" }}>
          <AppIcon app={app} size={args.size} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--content-subtle)" }}>{app}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-5)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)" }}>
          <AppIcon app={args.app} size={size} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--content-subtle)" }}>{size}</span>
        </div>
      ))}
    </div>
  ),
};
