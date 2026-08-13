import type { Meta, StoryObj } from "@storybook/react";
import { ProgressIndicator } from "@numosai/ui";
import type { ProgressIndicatorStep } from "@numosai/ui";

const meta: Meta<typeof ProgressIndicator> = {
  title: "Components/ProgressIndicator",
  component: ProgressIndicator,
  // No "autodocs" tag — ProgressIndicator.mdx is this component's docs page.
  // Components WITHOUT a hand-written .mdx file should keep `tags: ["autodocs"]`.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProgressIndicator>;

const EIGHT_STEPS: ProgressIndicatorStep[] = [
  { label: "Account", state: "completed" },
  { label: "Profile", state: "completed" },
  { label: "Team" },
  { label: "Billing" },
  { label: "Preferences" },
  { label: "Integrations" },
  { label: "Review" },
  { label: "Done" },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: "28rem" }}>
      <ProgressIndicator steps={EIGHT_STEPS} />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: "24rem" }}>
      <ProgressIndicator orientation="vertical" steps={EIGHT_STEPS} />
    </div>
  ),
};

export const WithError: Story = {
  name: "With an error step",
  render: () => (
    <div style={{ width: "24rem" }}>
      <ProgressIndicator
        steps={[
          { label: "Account", state: "completed" },
          { label: "Profile", state: "completed" },
          { label: "Payment", state: "error" },
          { label: "Review" },
        ]}
      />
    </div>
  ),
};

export const WithoutLabels: Story = {
  name: "Vertical, without labels",
  render: () => (
    <div style={{ height: "16rem" }}>
      <ProgressIndicator orientation="vertical" showStepTitle={false} steps={EIGHT_STEPS.slice(0, 4)} />
    </div>
  ),
};

export const WithoutTooltips: Story = {
  name: "showTooltips={false}",
  render: () => (
    <div style={{ width: "28rem" }}>
      <ProgressIndicator showTooltips={false} steps={EIGHT_STEPS} />
    </div>
  ),
};
