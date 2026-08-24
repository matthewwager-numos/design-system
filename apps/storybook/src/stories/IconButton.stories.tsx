import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Trash2, Settings } from "lucide-react";
import { IconButton } from "@numosai/ui";

// Controls can't represent a ReactNode (JSX) value directly — a "select"
// with a `mapping` lets the Controls panel offer icon choices by name while
// still passing a real <Icon /> element as the prop underneath.
const iconOptions = ["plus", "trash", "settings"];
const iconMapping = {
  plus: <Plus size={24} />,
  trash: <Trash2 size={24} />,
  settings: <Settings size={24} />,
};

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  // No "autodocs" tag — IconButton.mdx is this component's docs page.
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "accent"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    icon: { control: "select", options: iconOptions, mapping: iconMapping },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "primary",
    size: "md",
    icon: "plus",
    "aria-label": "Add",
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Accent: Story = {
  args: { variant: "accent" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
      <IconButton {...args} size="sm" icon={<Plus size={16} />} />
      <IconButton {...args} size="md" icon={<Plus size={24} />} />
      <IconButton {...args} size="lg" icon={<Plus size={24} />} />
    </div>
  ),
};

export const AllVariants: Story = {
  name: "All variants × sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {(["primary", "secondary", "ghost", "accent"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <span style={{ width: 80, font: "var(--type-paragraph-xs-regular)", color: "var(--content-subtle)" }}>{variant}</span>
          <IconButton variant={variant} size="sm" icon={<Trash2 size={16} />} aria-label="Delete" />
          <IconButton variant={variant} size="md" icon={<Trash2 size={24} />} aria-label="Delete" />
          <IconButton variant={variant} size="lg" icon={<Trash2 size={24} />} aria-label="Delete" />
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledAllVariants: Story = {
  name: "Disabled, all variants",
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
      {(["primary", "secondary", "ghost", "accent"] as const).map((variant) => (
        <IconButton key={variant} variant={variant} disabled icon={<Settings size={24} />} aria-label="Settings" />
      ))}
    </div>
  ),
};
