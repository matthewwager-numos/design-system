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

export const IconAtEachSize: Story = {
  name: "Complete/error/notice, lg vs. md",
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-5)" }}>
      {(["complete", "error", "notice"] as const).map((status) => (
        <div key={status} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            {/* "notice" has no confirmed icon at "lg" yet — falls back to a
                plain-color pill like any other status, so it needs real
                children here or it'd render empty. */}
            <Badge status={status} size="lg">
              {status === "notice" ? "!" : undefined}
            </Badge>
            <Badge status={status} size="md" />
          </div>
          <span style={{ font: "var(--type-paragraph-xs-regular)", color: "var(--content-subtle)" }}>{status}</span>
        </div>
      ))}
    </div>
  ),
};
