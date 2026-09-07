import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "@numosai/ui";

const SAMPLE_DATA = [
  { label: "First", value: 58 },
  { label: "Second", value: 73 },
  { label: "Third", value: 94 },
  { label: "Fourth", value: 73 },
  { label: "Fifth", value: 96 },
];

// Same five series names/colors as SAMPLE_DATA above, now recurring across
// several categories (months) — the actual scenario a legend earns its
// keep for: color means "which series," the axis means "which month," and
// neither one substitutes for the other. Values match Figma's own
// clustered/stacked reference frames.
const SAMPLE_SERIES = [
  { key: "first", label: "First" },
  { key: "second", label: "Second" },
  { key: "third", label: "Third" },
  { key: "fourth", label: "Fourth" },
  { key: "fifth", label: "Fifth" },
];

const SAMPLE_GROUPED_DATA = [
  { category: "Jan", values: { first: 58, second: 73, third: 94, fourth: 73, fifth: 96 } },
  { category: "Feb", values: { first: 40, second: 45, third: 62, fourth: 66, fifth: 60 } },
  { category: "Mar", values: { first: 58, second: 73, third: 94, fourth: 73, fifth: 96 } },
  { category: "Apr", values: { first: 24, second: 45, third: 55, fourth: 45, fifth: 60 } },
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
    showLegend: false,
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

export const WithLegend: Story = {
  name: "Legend, when there's no room for labels",
  args: { showCategoryLabels: false, showLegend: true },
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

export const Clustered: Story = {
  name: "Clustered (several series per category)",
  // A separate render rather than `args`, since this variant's `data`/
  // `series` shape is structurally different from the single-bar variant
  // the rest of this file's `args` are typed for.
  render: () => (
    <div style={{ width: "24rem" }}>
      <BarChart variant="clustered" data={SAMPLE_GROUPED_DATA} series={SAMPLE_SERIES} height={180} />
    </div>
  ),
};

export const Stacked: Story = {
  name: "Stacked (several series per category)",
  render: () => (
    <div style={{ width: "24rem" }}>
      <BarChart variant="stacked" data={SAMPLE_GROUPED_DATA} series={SAMPLE_SERIES} height={180} />
    </div>
  ),
};
