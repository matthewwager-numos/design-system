import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "@numosai/ui";

const CATEGORIES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const SERIES = [
  { label: "Revenue", values: [40, 55, 48, 62, 70, 66] },
  { label: "Expenses", values: [30, 32, 38, 35, 42, 40] },
  { label: "Profit", values: [10, 23, 10, 27, 28, 26] },
];

const meta: Meta<typeof LineChart> = {
  title: "Components/Chart-Line",
  component: LineChart,
  // No "autodocs" tag — Chart-Line.mdx is this component's docs page.
  argTypes: {
    categories: { control: false },
    series: { control: false },
  },
  args: {
    categories: CATEGORIES,
    series: SERIES,
    showLegend: true,
    showGridLines: true,
    showAxisLabels: true,
    showCategoryLabels: true,
  },
};

export default meta;
type Story = StoryObj<typeof LineChart>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <LineChart {...args} />
    </div>
  ),
};

export const SingleSeries: Story = {
  args: { series: [SERIES[0]!] },
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <LineChart {...args} />
    </div>
  ),
};

export const GridLinesHidden: Story = {
  name: "Grid lines & axis labels hidden",
  args: { showGridLines: false, showAxisLabels: false },
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <LineChart {...args} />
    </div>
  ),
};

export const LegendHidden: Story = {
  name: "Legend hidden",
  args: { showLegend: false },
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <LineChart {...args} />
    </div>
  ),
};
