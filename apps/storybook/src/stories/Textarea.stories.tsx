import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@numosai/ui";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  // No "autodocs" tag — Textarea.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    status: { control: "select", options: ["default", "error", "success"] },
    label: { control: "text" },
    helpText: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "lg",
    status: "default",
    label: "Description",
    placeholder: "This is placeholder text that is multiline",
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Textarea key={size} {...args} size={size} label={`Size: ${size}`} />
      ))}
    </div>
  ),
};

export const ErrorState: Story = {
  name: "Error",
  args: { status: "error", helpText: "Description is required", defaultValue: "" },
};

export const SuccessState: Story = {
  name: "Success",
  args: { status: "success", helpText: "Looks good", defaultValue: "This project tracks quarterly OKRs." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "This field can't be edited right now." },
};
