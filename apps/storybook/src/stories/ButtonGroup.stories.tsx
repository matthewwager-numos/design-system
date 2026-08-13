import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonGroup } from "@numosai/ui";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  // No "autodocs" tag — ButtonGroup.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Submit</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  name: 'orientation="vertical"',
  render: () => (
    <div style={{ width: "12rem" }}>
      <ButtonGroup orientation="vertical">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Submit</Button>
      </ButtonGroup>
    </div>
  ),
};

export const ThreeButtons: Story = {
  name: "Three buttons",
  render: () => (
    <ButtonGroup>
      <Button variant="link">Reset</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="primary">Publish</Button>
    </ButtonGroup>
  ),
};
