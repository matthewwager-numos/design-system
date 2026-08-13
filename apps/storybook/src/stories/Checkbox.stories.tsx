import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, CheckboxGroup } from "@numosai/ui";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  // No "autodocs" tag — Checkbox.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    label: { control: "text" },
    helpText: { control: "text" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  args: {
    label: "Send me product updates",
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => {
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return <Checkbox {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
    }
    return <Controlled />;
  },
};

export const Indeterminate: Story = {
  args: { label: "Select all", indeterminate: true },
};

export const Error: Story = {
  args: { label: "I agree to the terms", error: true, helpText: "You must agree to continue" },
};

export const Disabled: Story = {
  args: { label: "Unavailable option", disabled: true },
};

export const DisabledChecked: Story = {
  name: "Disabled + checked",
  args: { label: "Locked in", disabled: true, checked: true },
};

export const Group: Story = {
  render: () => (
    <CheckboxGroup label="Notify me about" helpText="Pick as many as you'd like">
      <Checkbox label="Comments" defaultChecked />
      <Checkbox label="Mentions" defaultChecked />
      <Checkbox label="Weekly digest" />
    </CheckboxGroup>
  ),
};
