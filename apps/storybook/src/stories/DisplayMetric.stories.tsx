import type { Meta, StoryObj } from "@storybook/react";
import { DisplayMetric } from "@numosai/ui";

const PREVIEW_STYLE = { width: "20rem" };

const meta: Meta<typeof DisplayMetric> = {
  title: "Components/DisplayMetric",
  component: DisplayMetric,
  argTypes: {
    color: {
      control: "select",
      options: ["brand", "green", "magenta", "yellow"],
    },
    value: { control: "text" },
    label: { control: "text" },
  },
  args: {
    value: "$24.2K",
    label: "Label",
    color: "green",
  },
};

export default meta;
type Story = StoryObj<typeof DisplayMetric>;

export const Default: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DisplayMetric {...args} />
    </div>
  ),
};

export const Brand: Story = {
  args: { color: "brand", label: "Active users" },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DisplayMetric {...args} />
    </div>
  ),
};

export const Magenta: Story = {
  args: { color: "magenta", value: "-$3.1K", label: "Refunds" },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DisplayMetric {...args} />
    </div>
  ),
};

export const Yellow: Story = {
  args: { color: "yellow", value: "12", label: "Open tickets" },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DisplayMetric {...args} />
    </div>
  ),
};

export const AllColors: Story = {
  name: "All 4 colors",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
      <div style={PREVIEW_STYLE}>
        <DisplayMetric value="$24.2K" label="Revenue" color="green" />
      </div>
      <div style={PREVIEW_STYLE}>
        <DisplayMetric value="1,204" label="Active users" color="brand" />
      </div>
      <div style={PREVIEW_STYLE}>
        <DisplayMetric value="-$3.1K" label="Refunds" color="magenta" />
      </div>
      <div style={PREVIEW_STYLE}>
        <DisplayMetric value="12" label="Open tickets" color="yellow" />
      </div>
    </div>
  ),
};

export const InAGrid: Story = {
  name: "Laid out in a responsive grid",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
      <div style={{ flex: "1 1 14rem" }}>
        <DisplayMetric value="$24.2K" label="Revenue" color="green" />
      </div>
      <div style={{ flex: "1 1 14rem" }}>
        <DisplayMetric value="1,204" label="Active users" color="brand" />
      </div>
      <div style={{ flex: "1 1 14rem" }}>
        <DisplayMetric value="-$3.1K" label="Refunds" color="magenta" />
      </div>
    </div>
  ),
};
