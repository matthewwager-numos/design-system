import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "@numosai/ui";

const FRUIT_OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian", disabled: true },
  { value: "elderberry", label: "Elderberry" },
];

// Same reasoning as Select.stories.tsx's own PREVIEW_STYLE — DropdownMenuContent
// is position: absolute, so Storybook's Canvas needs an explicit min-height or
// it clips the menu once opened.
const PREVIEW_STYLE = { minHeight: 280, width: "16rem" };

const meta: Meta<typeof MultiSelect> = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  // No "autodocs" tag — MultiSelect.mdx is this component's docs page.
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
    placeholder: "Select fruit",
    status: "default",
    size: "lg",
  },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <MultiSelect {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {};

export const WithSelection: Story = {
  name: "With a selection (closed)",
  args: { defaultValue: ["banana", "cherry"] },
};

export const Error: Story = {
  args: { status: "error", helpText: "Please choose at least one fruit." },
};

export const Success: Story = {
  args: { status: "success", defaultValue: ["cherry"], helpText: "Good choices!" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: ["banana"] },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--space-6)", ...PREVIEW_STYLE, width: "auto" }}>
      <MultiSelect {...args} size="sm" label="Small" defaultValue={["banana"]} />
      <MultiSelect {...args} size="md" label="Medium" defaultValue={["banana"]} />
      <MultiSelect {...args} size="lg" label="Large" defaultValue={["banana"]} />
    </div>
  ),
};
