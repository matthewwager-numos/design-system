import type { Meta, StoryObj } from "@storybook/react";
import { Check, X, Info as InfoIcon, AlertTriangle } from "lucide-react";
import { Label } from "@numosai/ui";

// Controls can't represent a ReactNode (JSX) value directly — a "select" with
// a `mapping` lets the Controls panel offer icon choices by name while still
// passing a real <Icon /> element as the prop underneath.
const iconOptions = ["none", "check", "x", "info", "alert-triangle"];
const iconMapping = {
  none: undefined,
  check: <Check size={16} />,
  x: <X size={16} />,
  info: <InfoIcon size={16} />,
  "alert-triangle": <AlertTriangle size={16} />,
};

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  // No "autodocs" tag — Label.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    status: {
      control: "select",
      options: ["neutral", "positive", "negative", "notice", "info"],
    },
    size: {
      control: "select",
      options: ["md", "lg"],
    },
    children: { control: "text" },
    leadingIcon: { control: "select", options: iconOptions, mapping: iconMapping },
    trailingIcon: { control: "select", options: iconOptions, mapping: iconMapping },
  },
  args: {
    children: "Label",
    status: "neutral",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Neutral: Story = {};

export const Positive: Story = {
  args: { status: "positive", children: "Active" },
};

export const Negative: Story = {
  args: { status: "negative", children: "Failed" },
};

export const Notice: Story = {
  args: { status: "notice", children: "Pending" },
};

export const Info: Story = {
  args: { status: "info", children: "Draft" },
};

export const WithIcon: Story = {
  args: { status: "positive", children: "Verified", leadingIcon: "check" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
      <Label {...args} size="md" />
      <Label {...args} size="lg" />
    </div>
  ),
};
