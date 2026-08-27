import type { Meta, StoryObj } from "@storybook/react";
import { AreaChart } from "@numosai/ui";

const VALUES = [
  62000, 78000, 71000, 54000, 41000, 48000, 66000, 82000, 74000, 68000, 79000, 91000, 84000, 77000, 89000, 96000, 88000, 81000, 93000, 102000, 95000, 87000, 79000, 86000, 94000,
  101000, 108000, 99000, 91000, 110000, 123456,
];

const DATA = VALUES.map((value, i) => ({ date: new Date(2026, 0, i + 1), value }));

const meta: Meta<typeof AreaChart> = {
  title: "Components/Chart-Area",
  component: AreaChart,
  // No "autodocs" tag — Chart-Area.mdx is this component's docs page.
  parameters: { layout: "padded" },
  argTypes: {
    data: { control: false },
    height: { control: { type: "number", min: 80, max: 320, step: 8 } },
  },
  args: {
    data: DATA,
    "aria-label": "Revenue over the last 31 days",
  },
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <AreaChart {...args} />
    </div>
  ),
};

export const CustomFormatting: Story = {
  name: "Custom value/date formatting",
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <AreaChart {...args} formatValue={(value) => `$${value.toLocaleString()}`} />
    </div>
  ),
};

export const CustomColor: Story = {
  name: "Custom color",
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <AreaChart {...args} color="var(--chart-3)" fillColor="color-mix(in srgb, var(--chart-3) 15%, transparent)" />
    </div>
  ),
};

export const TallerPlot: Story = {
  name: "Taller plot (height)",
  args: { height: 240 },
  render: (args) => (
    <div style={{ width: "24rem" }}>
      <AreaChart {...args} />
    </div>
  ),
};

export const FewPoints: Story = {
  name: "Few data points",
  args: { data: DATA.filter((_, i) => i % 6 === 0) },
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <AreaChart {...args} />
    </div>
  ),
};
