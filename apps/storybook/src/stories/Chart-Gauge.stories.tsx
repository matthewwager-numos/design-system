import type { Meta, StoryObj } from "@storybook/react";
import { GaugeChart } from "@numosai/ui";

const meta: Meta<typeof GaugeChart> = {
  title: "Components/Chart-Gauge",
  component: GaugeChart,
  // No "autodocs" tag — Chart-Gauge.mdx is this component's docs page.
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    mode: {
      control: "select",
      options: ["negative-to-positive", "positive-to-negative", "info", "positive", "notice", "negative"],
    },
    size: { control: "select", options: ["xs", "sm", "md", "xl"] },
    label: { control: "text" },
    showValue: { control: "boolean" },
  },
  args: {
    value: 50,
    label: "CPU usage",
    mode: "negative-to-positive",
    size: "xl",
  },
};

export default meta;
type Story = StoryObj<typeof GaugeChart>;

export const Default: Story = {};

export const NegativeToPositive: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-end" }}>
      <GaugeChart value={0} label="Empty" />
      <GaugeChart value={25} label="Low" />
      <GaugeChart value={50} label="Medium" />
      <GaugeChart value={75} label="High" />
      <GaugeChart value={100} label="Complete" />
    </div>
  ),
};

export const PositiveToNegative: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-end" }}>
      <GaugeChart mode="positive-to-negative" value={10} label="Error rate" />
      <GaugeChart mode="positive-to-negative" value={40} label="Error rate" />
      <GaugeChart mode="positive-to-negative" value={80} label="Error rate" />
    </div>
  ),
};

export const FixedColor: Story = {
  args: { mode: "info", value: 40, label: "Signal" },
};

export const AllFixedColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-end" }}>
      <GaugeChart mode="info" value={40} label="info" />
      <GaugeChart mode="positive" value={40} label="positive" />
      <GaugeChart mode="notice" value={40} label="notice" />
      <GaugeChart mode="negative" value={40} label="negative" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-end" }}>
      <GaugeChart size="xs" value={65} />
      <GaugeChart size="sm" value={65} />
      <GaugeChart size="md" value={65} label="Storage" />
      <GaugeChart size="xl" value={65} label="Storage" />
    </div>
  ),
};

export const WithoutValue: Story = {
  args: { showValue: false },
};

export const WithoutLabel: Story = {
  args: { label: undefined },
};
