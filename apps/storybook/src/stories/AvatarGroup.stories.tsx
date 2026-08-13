import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarGroup } from "@numosai/ui";

const NAMES = ["Maya Chen", "Sam Ortiz", "Priya Nair", "Jonah Lee", "Elena Petrova"];

const meta: Meta<typeof AvatarGroup> = {
  title: "Components/AvatarGroup",
  component: AvatarGroup,
  // No "autodocs" tag — AvatarGroup.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    overlap: { control: { type: "range", min: -8, max: 24, step: 1 } },
    randomizeColors: { control: "boolean" },
  },
  args: {
    orientation: "horizontal",
    overlap: 8,
    randomizeColors: false,
  },
  render: (args) => (
    <AvatarGroup {...args}>
      {NAMES.map((name) => (
        <Avatar key={name} name={name} size="md" />
      ))}
    </AvatarGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
};

export const NoOverlap: Story = {
  name: "No overlap (spaced out)",
  args: { overlap: -8 },
};

export const HeavyOverlap: Story = {
  args: { overlap: 20 },
};

export const RandomizedColors: Story = {
  args: { randomizeColors: true },
};

export const ExplicitColorsWin: Story = {
  name: "Explicit avatar colors take priority",
  args: { randomizeColors: true },
  render: (args) => (
    <AvatarGroup {...args}>
      <Avatar name="Maya Chen" size="md" color="positive" />
      <Avatar name="Sam Ortiz" size="md" />
      <Avatar name="Priya Nair" size="md" />
    </AvatarGroup>
  ),
};
