import type { Meta, StoryObj } from "@storybook/react";
import { BubbleChart } from "@numosai/ui";

const DATA = [
  { label: "First", x: 78, y: 82, size: 58 },
  { label: "Second", x: 43, y: 88, size: 34 },
  { label: "Third", x: 47, y: 28, size: 44 },
  { label: "Fourth", x: 50, y: 92, size: 22 },
  { label: "Fifth", x: 62, y: 32, size: 24 },
];

const meta: Meta<typeof BubbleChart> = {
  title: "Components/Chart-Bubble",
  component: BubbleChart,
  // No "autodocs" tag — Chart-Bubble.mdx is this component's docs page.
  argTypes: { data: { control: false } },
  args: {
    data: DATA,
    showLegend: true,
    showGridLines: true,
    showAxisLabels: true,
  },
};

export default meta;
type Story = StoryObj<typeof BubbleChart>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BubbleChart {...args} />
    </div>
  ),
};

export const GridLinesHidden: Story = {
  name: "Grid lines & axis labels hidden",
  args: { showGridLines: false, showAxisLabels: false },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BubbleChart {...args} />
    </div>
  ),
};

export const LegendHidden: Story = {
  name: "Legend hidden",
  args: { showLegend: false },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BubbleChart {...args} />
    </div>
  ),
};

export const SizeRange: Story = {
  name: "Custom diameter range",
  args: { minDiameter: 8, maxDiameter: 96 },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <BubbleChart {...args} />
    </div>
  ),
};
