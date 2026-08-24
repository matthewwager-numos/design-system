import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "@numosai/ui";

const ITEMS = [
  { label: "Root", href: "#" },
  { label: "Trunk", href: "#" },
  { label: "Branch", href: "#" },
  { label: "Leaf" },
];

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  // No "autodocs" tag — Breadcrumb.mdx is this component's docs page.
  parameters: { layout: "padded" },
  argTypes: {
    items: { control: false },
    separator: { control: "select", options: ["chevron", "slash"] },
  },
  args: {
    items: ITEMS,
    separator: "chevron",
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

export const Slash: Story = {
  name: 'separator="slash"',
  args: { separator: "slash" },
};

export const TwoLevels: Story = {
  name: "Two levels",
  args: { items: [{ label: "Employees", href: "#" }, { label: "Ada Lovelace" }] },
};

export const NonInteractiveCrumb: Story = {
  name: "A crumb with no href/onClick",
  args: {
    items: [
      { label: "Root", href: "#" },
      { label: "Archived (2019)" },
      { label: "Branch", href: "#" },
      { label: "Leaf" },
    ],
  },
};

export const OnClickHandlers: Story = {
  name: "onClick instead of href",
  render: (args) => (
    <Breadcrumb
      {...args}
      items={[
        { label: "Root", onClick: () => alert("Navigate to Root") },
        { label: "Trunk", onClick: () => alert("Navigate to Trunk") },
        { label: "Leaf" },
      ]}
    />
  ),
};
