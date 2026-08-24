import type { Meta, StoryObj } from "@storybook/react";
import { DonutChart } from "@numosai/ui";

const DATA = [
  { label: "First", value: 38 },
  { label: "Second", value: 27 },
  { label: "Third", value: 18 },
  { label: "Fourth", value: 11 },
  { label: "Fifth", value: 6 },
];

const meta: Meta<typeof DonutChart> = {
  title: "Components/Chart-Donut",
  component: DonutChart,
  // No "autodocs" tag — Chart-Donut.mdx is this component's docs page.
  argTypes: { data: { control: false } },
  args: {
    data: DATA,
    centerLabel: "Total",
    showLegend: true,
    showCenterLabel: true,
  },
};

export default meta;
type Story = StoryObj<typeof DonutChart>;

export const Default: Story = {
  render: (args) => <DonutChart {...args} />,
};

export const CenterLabelHidden: Story = {
  name: "Center label hidden",
  args: { showCenterLabel: false },
  render: (args) => <DonutChart {...args} />,
};

export const LegendHidden: Story = {
  name: "Legend hidden",
  args: { showLegend: false },
  render: (args) => <DonutChart {...args} />,
};

export const CustomCenterValue: Story = {
  name: "Custom center value",
  args: { centerValue: "$142k", centerLabel: "Revenue" },
  render: (args) => <DonutChart {...args} />,
};
