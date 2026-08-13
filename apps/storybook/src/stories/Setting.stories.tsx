import type { Meta, StoryObj } from "@storybook/react";
import { Setting } from "@numosai/ui";

const meta: Meta<typeof Setting> = {
  title: "Components/Setting",
  component: Setting,
  // No "autodocs" tag — Setting.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Setting>;

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

const NOTIFY_OPTIONS = [
  { value: "digest", label: "Weekly digest" },
  { value: "mentions", label: "Mentions" },
  { value: "comments", label: "Comments" },
];

const PREVIEW_STYLE = { width: "28rem" };

function ReadEditPair(props: React.ComponentProps<typeof Setting>) {
  return (
    <div style={{ ...PREVIEW_STYLE, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Setting {...props} edit={false} />
      <Setting {...props} edit={true} />
    </div>
  );
}

export const Text: Story = {
  render: () => <ReadEditPair label="Full name" type="text" value="Maya Chen" />,
};

export const Textarea: Story = {
  render: () => <ReadEditPair label="Bio" type="textarea" value="Product designer focused on data-heavy tools." />,
};

export const Select: Story = {
  render: () => <ReadEditPair label="Role" type="select" value="admin" options={ROLE_OPTIONS} />,
};

export const Radio: Story = {
  render: () => <ReadEditPair label="Role" type="radio" value="admin" options={ROLE_OPTIONS} />,
};

export const Checkbox: Story = {
  render: () => <ReadEditPair label="Notifications" type="checkbox" values={["digest", "mentions"]} options={NOTIFY_OPTIONS} />,
};

export const Slider: Story = {
  render: () => <ReadEditPair label="Storage used" type="slider" value="75" />,
};

export const Toggle: Story = {
  render: () => <ReadEditPair label="Two-factor authentication" type="toggle" checked={true} />,
};

export const SegmentedControlType: Story = {
  name: "segmentedControl",
  render: () => <ReadEditPair label="Employment type" type="segmentedControl" value="fulltime" options={[
    { value: "fulltime", label: "Full-time" },
    { value: "parttime", label: "Part-time" },
    { value: "contract", label: "Contract" },
  ]} />,
};
