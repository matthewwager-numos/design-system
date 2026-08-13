import type { Meta, StoryObj } from "@storybook/react";
import { Banner } from "@numosai/ui";

const meta: Meta<typeof Banner> = {
  title: "Components/Banner",
  component: Banner,
  // No "autodocs" tag — Banner.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  argTypes: {
    status: {
      control: "select",
      options: ["neutral", "positive", "negative", "notice", "info"],
    },
    title: { control: "text" },
    description: { control: "text" },
    dismissible: { control: "boolean" },
  },
  args: {
    status: "neutral",
    title: "Title",
    description: "Description",
  },
  render: (args) => (
    <div style={{ width: "16rem" }}>
      <Banner {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {};

export const Positive: Story = {
  args: { status: "positive", title: "Payment received", description: "Your invoice has been paid in full." },
};

export const Negative: Story = {
  args: { status: "negative", title: "Payment failed", description: "Your card was declined." },
};

export const Notice: Story = {
  args: { status: "notice", title: "Trial ending soon", description: "Your trial ends in 3 days." },
};

export const Info: Story = {
  args: { status: "info", title: "New feature", description: "Dark mode is now available in settings." },
};

export const WithoutDismiss: Story = {
  args: { dismissible: false },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", width: "16rem" }}>
      <Banner status="neutral" title="Neutral" description="Description" />
      <Banner status="positive" title="Positive" description="Description" />
      <Banner status="negative" title="Negative" description="Description" />
      <Banner status="notice" title="Notice" description="Description" />
      <Banner status="info" title="Info" description="Description" />
    </div>
  ),
};
