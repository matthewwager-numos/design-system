import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "@numosai/ui";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  // No "autodocs" tag — ProgressBar.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    mode: {
      control: "select",
      options: ["negative-to-positive", "positive-to-negative", "info", "positive", "notice", "negative"],
    },
    label: { control: "text" },
    showValue: { control: "boolean" },
    inline: { control: "boolean" },
  },
  args: {
    value: 50,
    label: "Profile completion",
    mode: "negative-to-positive",
  },
  render: (args) => (
    <div style={{ width: "16rem" }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};

export const NegativeToPositive: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "16rem" }}>
      <ProgressBar value={0} label="Empty" />
      <ProgressBar value={25} label="Low" />
      <ProgressBar value={50} label="Medium" />
      <ProgressBar value={75} label="High" />
      <ProgressBar value={100} label="Complete" />
    </div>
  ),
};

export const PositiveToNegative: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "16rem" }}>
      <ProgressBar mode="positive-to-negative" value={10} label="Error rate" />
      <ProgressBar mode="positive-to-negative" value={40} label="Error rate" />
      <ProgressBar mode="positive-to-negative" value={80} label="Error rate" />
    </div>
  ),
};

export const FixedColor: Story = {
  args: { mode: "info", value: 40, label: "Uploading…" },
};

export const AllFixedColors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "16rem" }}>
      <ProgressBar mode="info" value={40} label="info" />
      <ProgressBar mode="positive" value={40} label="positive" />
      <ProgressBar mode="notice" value={40} label="notice" />
      <ProgressBar mode="negative" value={40} label="negative" />
    </div>
  ),
};

export const Inline: Story = {
  args: { inline: true, value: 62, label: "Storage" },
};

export const WithoutValue: Story = {
  args: { showValue: false },
};

export const WithoutLabel: Story = {
  args: { label: undefined },
};
