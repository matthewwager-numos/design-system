import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "@numosai/ui";

const FRUIT_OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian", disabled: true },
  { value: "elderberry", label: "Elderberry" },
];

// DropdownMenuContent is position: absolute, so it doesn't add height to its
// in-flow parent — without an explicit min-height, Storybook's Canvas sizes
// itself to the (closed-height) field alone and clips the menu once opened.
const PREVIEW_STYLE = { minHeight: 220, width: "16rem" };

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  // No "autodocs" tag — Select.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    options: { control: false },
    status: {
      control: "select",
      options: ["default", "error", "success"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    helpText: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Fruit",
    placeholder: "Select a fruit",
    status: "default",
    size: "lg",
  },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <Select {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { defaultValue: "banana" },
};

export const Error: Story = {
  args: { status: "error", helpText: "Please choose a fruit." },
};

export const Success: Story = {
  args: { status: "success", defaultValue: "cherry", helpText: "Good choice!" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--space-6)", ...PREVIEW_STYLE, width: "auto" }}>
      <Select {...args} size="sm" label="Small" />
      <Select {...args} size="md" label="Medium" />
      <Select {...args} size="lg" label="Large" />
    </div>
  ),
};
