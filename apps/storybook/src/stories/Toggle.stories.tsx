import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "@numosai/ui";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  // No "autodocs" tag — Toggle.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    labelPlacement: { control: "select", options: ["right", "left", "above"] },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "lg",
    label: "Enable notifications",
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: (args) => {
    function Controlled() {
      const [checked, setChecked] = useState(true);
      return <Toggle {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
    }
    return <Controlled />;
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "flex-start" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Toggle key={size} {...args} size={size} label={`Size: ${size}`} defaultChecked />
      ))}
    </div>
  ),
};

export const LabelPlacement: Story = {
  name: "Label placement",
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "flex-start" }}>
      <Toggle {...args} labelPlacement="right" label="Right (default)" defaultChecked />
      <Toggle {...args} labelPlacement="left" label="Left" defaultChecked />
      <Toggle {...args} labelPlacement="above" label="Above" defaultChecked />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "flex-start" }}>
      <Toggle {...args} label="Disabled, off" disabled />
      <Toggle {...args} label="Disabled, on" disabled defaultChecked />
    </div>
  ),
};
