import type { Meta, StoryObj } from "@storybook/react";
import { EmployeeWizardPage } from "./EmployeeWizardPage";

const meta: Meta<typeof EmployeeWizardPage> = {
  title: "Templates/Wizard",
  component: EmployeeWizardPage,
  // No "autodocs" tag — EmployeeWizardPage.mdx is this template's docs page.
  parameters: {
    layout: "fullscreen",
    // Full-page templates opt out of the per-component light/dark split —
    // see preview.tsx's withThemeSplit decorator.
    noThemeSplit: true,
  },
};

export default meta;
type Story = StoryObj<typeof EmployeeWizardPage>;

export const Default: Story = {
  name: "Create object (multi-step)",
  render: () => <EmployeeWizardPage />,
};
