import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Radio, RadioGroup } from "@numosai/ui";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/Radio",
  component: RadioGroup,
  // No "autodocs" tag — Radio.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => {
    function Controlled() {
      const [value, setValue] = useState("weekly");
      return (
        <RadioGroup label="Email frequency" value={value} onValueChange={setValue}>
          <Radio value="daily" label="Daily" />
          <Radio value="weekly" label="Weekly" />
          <Radio value="monthly" label="Monthly" />
        </RadioGroup>
      );
    }
    return <Controlled />;
  },
};

export const Binary: Story = {
  name: "Binary choice (inline)",
  render: () => {
    function Controlled() {
      const [value, setValue] = useState("true");
      return (
        <RadioGroup label="Is this a recurring charge?" orientation="horizontal" value={value} onValueChange={setValue}>
          <Radio value="true" label="Yes" />
          <Radio value="false" label="No" />
        </RadioGroup>
      );
    }
    return <Controlled />;
  },
};

export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <RadioGroup label="Choose a plan" defaultValue="" error helpText="Select a plan to continue">
      <Radio value="starter" label="Starter" error />
      <Radio value="pro" label="Pro" error />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup label="Shipping speed" defaultValue="standard">
      <Radio value="standard" label="Standard (5-7 days)" />
      <Radio value="express" label="Express (2 days)" disabled />
    </RadioGroup>
  ),
};
