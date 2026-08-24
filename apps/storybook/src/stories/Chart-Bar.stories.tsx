import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "@numosai/ui";

const SAMPLE_DATA = [
  { label: "First", value: 58 },
  { label: "Second", value: 73 },
  { label: "Third", value: 94 },
  { label: "Fourth", value: 73 },
  { label: "Fifth", value: 96 },
];

const meta: Meta<typeof BarChart> = {
  title: "Components/Chart-Bar",
  component: BarChart,
  // No "autodocs" tag — Chart-Bar.mdx is this component's docs page.
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    data: { control: false },
  },
  args: {
    data: SAMPLE_DATA,
    orientation: "vertical",
    showLegend: true,
    showGridLines: true,
    showAxisLabels: true,
    showCategoryLabels: true,
  },
};

export default meta;
type Story = StoryObj<typeof BarChart>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BarChart {...args} />
    </div>
  ),
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BarChart {...args} />
    </div>
  ),
};

export const GridLinesHidden: Story = {
  name: "Grid lines & axis labels hidden",
  args: { showGridLines: false, showAxisLabels: false },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BarChart {...args} />
    </div>
  ),
};

export const LegendHidden: Story = {
  name: "Legend hidden",
  args: { showLegend: false },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BarChart {...args} />
    </div>
  ),
};

export const Minimal: Story = {
  name: "Just the bars",
  args: { showLegend: false, showGridLines: false, showAxisLabels: false, showCategoryLabels: false },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BarChart {...args} />
    </div>
  ),
};
