import type { Meta, StoryObj } from "@storybook/react";
import { Save, Trash2, ArrowRight, Check, Download } from "lucide-react";
import { Button } from "@numosai/ui";

// Controls can't represent a ReactNode (JSX) value directly — a "select" with
// a `mapping` lets the Controls panel offer icon choices by name while still
// passing a real <Icon /> element as the prop underneath.
const iconOptions = ["none", "save", "trash", "arrow-right", "check", "download"];
const iconMapping = {
  none: undefined,
  save: <Save size={16} />,
  trash: <Trash2 size={16} />,
  "arrow-right": <ArrowRight size={16} />,
  check: <Check size={16} />,
  download: <Download size={16} />,
};

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  // No "autodocs" tag — Button.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
    leadingIcon: { control: "select", options: iconOptions, mapping: iconMapping },
    trailingIcon: { control: "select", options: iconOptions, mapping: iconMapping },
  },
  args: {
    children: "Save changes",
    variant: "primary",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Accent: Story = {
  args: { variant: "accent" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete project" },
};

export const Link: Story = {
  args: { variant: "link" },
};

export const WithIcon: Story = {
  args: { leadingIcon: "save", children: "Save changes" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, children: "Can't click me" },
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: "Full-width button" },
  parameters: { layout: "padded" },
};
