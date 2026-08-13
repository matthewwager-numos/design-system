import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@numosai/ui";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  // No "autodocs" tag — Badge.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    status: {
      control: "select",
      options: ["neutral", "positive", "negative", "notice", "info", "complete", "error"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    children: { control: "text" },
  },
  args: {
    children: "0",
    status: "neutral",
    size: "lg",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {};

export const Positive: Story = {
  args: { status: "positive" },
};

export const Negative: Story = {
  args: { status: "negative" },
};

export const Notice: Story = {
  args: { status: "notice" },
};

export const Info: Story = {
  args: { status: "info" },
};

export const Complete: Story = {
  args: { status: "complete" },
};

export const Error: Story = {
  args: { status: "error" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
      <Badge {...args} size="sm" />
      <Badge {...args} size="md" />
      <Badge {...args} size="lg" />
    </div>
  ),
};
