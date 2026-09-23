import type { Meta, StoryObj } from "@storybook/react";
import { RichTextEditor } from "@numosai/ui";

const meta: Meta<typeof RichTextEditor> = {
  title: "Components/RichTextEditor",
  component: RichTextEditor,
  // No "autodocs" tag — RichTextEditor.mdx is this component's docs page.
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
    placeholder: "This is placeholder text that is multiline.",
  },
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {};

export const WithContent: Story = {
  args: {
    label: "Update",
    defaultValue: "<div><b>Renewal confirmed.</b> The vendor accepted our terms — invoice due <i>Net 30</i>.</div>",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <RichTextEditor key={size} {...args} size={size} label={`Size: ${size}`} />
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  name: "With lead/trailing icons",
  args: {
    label: "Comment",
    leadingIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
};

export const WithPrefixAndSuffix: Story = {
  name: "With prefix and suffix",
  args: { label: "Amount", prefix: "$", suffix: "USD", defaultValue: "15.00" },
};

export const ErrorState: Story = {
  name: "Error",
  args: { status: "error", helpText: "A comment is required" },
};

export const SuccessState: Story = {
  name: "Success",
  args: { status: "success", helpText: "Looks good", defaultValue: "Reviewed and approved." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "This field can't be edited right now." },
};
