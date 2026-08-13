import type { Meta, StoryObj } from "@storybook/react";
import { Search, Mail, Eye } from "lucide-react";
import { TextInput } from "@numosai/ui";

// Controls can't represent a ReactNode (JSX) value directly — a "select" with
// a `mapping` lets the Controls panel offer icon choices by name while still
// passing a real <Icon /> element as the prop underneath.
const iconOptions = ["none", "search", "mail", "eye"];
const iconMapping = {
  none: undefined,
  search: <Search size={16} />,
  mail: <Mail size={16} />,
  eye: <Eye size={16} />,
};

const meta: Meta<typeof TextInput> = {
  title: "Components/TextInput",
  component: TextInput,
  // No "autodocs" tag — TextInput.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
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
    leadingIcon: { control: "select", options: iconOptions, mapping: iconMapping },
    trailingIcon: { control: "select", options: iconOptions, mapping: iconMapping },
  },
  args: {
    label: "Label",
    placeholder: "Text",
    status: "default",
    size: "lg",
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};

export const WithHelpText: Story = {
  args: { helpText: "We'll never share this with anyone." },
};

export const WithIcon: Story = {
  args: { label: "Email", placeholder: "you@example.com", leadingIcon: "mail" },
};

export const Error: Story = {
  args: { status: "error", helpText: "This field is required." },
};

export const Success: Story = {
  args: { status: "success", helpText: "Looks good!" },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Can't edit this" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "16rem" }}>
      <TextInput {...args} size="sm" label="Small" />
      <TextInput {...args} size="md" label="Medium" />
      <TextInput {...args} size="lg" label="Large" />
    </div>
  ),
};
