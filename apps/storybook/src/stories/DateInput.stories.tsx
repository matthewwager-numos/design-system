import type { Meta, StoryObj } from "@storybook/react";
import { DateInput } from "@numosai/ui";

const meta: Meta<typeof DateInput> = {
  title: "Components/DateInput",
  component: DateInput,
  // No "autodocs" tag — DateInput.mdx is this component's docs page.
  argTypes: {
    status: { control: "select", options: ["default", "error", "success"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    helpText: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Date",
    status: "default",
    size: "lg",
  },
  // DropdownMenuPanel is position: absolute, so it doesn't add height to
  // its in-flow parent — without an explicit min-height, Storybook's Canvas
  // sizes itself to the (closed-height) field alone and clips the open panel.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

const PREVIEW_STYLE = { minHeight: 340, width: "16rem" };

export const Default: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DateInput {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  name: "With a picked value",
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DateInput {...args} defaultValue={new Date(2026, 0, 11)} />
    </div>
  ),
};

export const WithHelpText: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DateInput {...args} helpText="Choose the day work is due." />
    </div>
  ),
};

export const Error: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DateInput {...args} status="error" helpText="A due date is required." />
    </div>
  ),
};

export const Success: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DateInput {...args} status="success" helpText="Looks good." defaultValue={new Date(2026, 0, 11)} />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <DateInput {...args} disabled defaultValue={new Date(2026, 0, 11)} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <DateInput size="sm" label="Size: sm" />
      <DateInput size="md" label="Size: md" />
      <DateInput size="lg" label="Size: lg" />
    </div>
  ),
};
