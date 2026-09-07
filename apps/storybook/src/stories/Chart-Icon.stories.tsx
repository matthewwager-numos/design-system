import type { Meta, StoryObj } from "@storybook/react";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconChart } from "@numosai/ui";

// `icons` is lucide-react's own name → component map (1700+ entries) — used
// with Storybook's `mapping` so the `icon` control can show/search a plain
// list of names (a native <select>'s own type-ahead already gives a decent
// "search" experience) while the story itself still receives the real
// component. `args.icon` below is authored as one of these *names* (a
// string), not a component — `mapping` resolves it before the story ever
// sees it, so the cast just tells TypeScript about that indirection.
const ICON_NAMES = Object.keys(icons).sort();
const iconArg = (name: keyof typeof icons) => name as unknown as LucideIcon;

// Matches Figma's own reference data — icon counts of 7/5/4/3/2 at
// unitValue=10 (one icon per 10 people).
const HEADCOUNT_DATA = [
  { label: "Sales", value: 70 },
  { label: "Support", value: 50 },
  { label: "Engineering", value: 40 },
  { label: "Executive", value: 30 },
  { label: "HR", value: 20 },
];

// No per-datum `color` here — a single category is exactly what the
// chart-level `color` prop (rather than `data[0].color`) is for.
const SINGLE_CATEGORY_DATA = [{ label: "Sales", value: 70 }];

const LABOR_COST_DATA = [
  { label: "Sales", value: 70, color: "var(--chart-3)" },
  { label: "Support", value: 60, color: "var(--chart-3)" },
  { label: "Engineering", value: 40, color: "var(--chart-3)" },
  { label: "Executive", value: 30, color: "var(--chart-3)" },
  { label: "HR", value: 20, color: "var(--chart-3)" },
];

const meta: Meta<typeof IconChart> = {
  title: "Components/Chart-Icon",
  component: IconChart,
  // No "autodocs" tag — Chart-Icon.mdx is this component's docs page.
  argTypes: {
    data: { control: false },
    icon: { control: { type: "select" }, options: ICON_NAMES, mapping: icons },
    iconSize: { control: { type: "radio" }, options: [16, 24] },
    color: {
      control: {
        type: "select",
        labels: {
          "var(--chart-1)": "Chart 1",
          "var(--chart-2)": "Chart 2",
          "var(--chart-3)": "Chart 3",
          "var(--chart-4)": "Chart 4",
          "var(--chart-5)": "Chart 5",
          "var(--content-placeholder)": "Placeholder",
        },
      },
      options: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--content-placeholder)"],
    },
    unitValue: { control: { type: "number", min: 1, step: 1 } },
  },
  args: {
    data: HEADCOUNT_DATA,
    icon: iconArg("User"),
    orientation: "horizontal",
    unitValue: 10,
    // A function, not a plain string — the number always matches whatever
    // `unitValue` control is dialed to, instead of risking a caption that
    // says "= 10" while the chart itself is actually using a different value.
    unitLabel: (unitValue) => `= ${unitValue} people`,
  },
};

export default meta;
type Story = StoryObj<typeof IconChart>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <IconChart {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  // Wider than the other stories' "20rem" — vertical columns now share a
  // fixed, uniform target width (see IconChart.css) rather than each
  // sizing to its own label, so five columns need more total room to all
  // read without truncating.
  args: { orientation: "vertical", data: LABOR_COST_DATA, icon: iconArg("Banknote"), unitLabel: (unitValue) => `= $${unitValue}K` },
  render: (args) => (
    <div style={{ width: "30rem" }}>
      <IconChart {...args} />
    </div>
  ),
};

export const NegativeGap: Story = {
  name: "Negative gap (overlapping icons)",
  args: {
    orientation: "vertical",
    data: LABOR_COST_DATA,
    icon: iconArg("Banknote"),
    unitLabel: (unitValue) => `= $${unitValue}K`,
    gap: -8,
    iconSize: 24,
  },
  render: (args) => (
    <div style={{ width: "30rem" }}>
      <IconChart {...args} />
    </div>
  ),
};

export const Wrap: Story = {
  name: "Wrap (single run, legend identifies color)",
  args: { orientation: "wrap" },
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <IconChart {...args} />
    </div>
  ),
};

export const WrapMaxPerLine: Story = {
  name: "Wrap with a fixed max per line",
  args: { orientation: "wrap", maxPerLine: 6 },
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <IconChart {...args} />
    </div>
  ),
};

export const SingleCategoryColor: Story = {
  name: "Single category (chart-level color)",
  args: { data: SINGLE_CATEGORY_DATA, color: "var(--chart-4)", unitLabel: undefined },
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <IconChart {...args} />
    </div>
  ),
};

export const CustomFill: Story = {
  name: "Fixed fill (independent of stroke color)",
  args: { fill: "var(--background-default)" },
  render: (args) => (
    <div style={{ width: "20rem" }}>
      <IconChart {...args} />
    </div>
  ),
};

// The "percentage" variant has a structurally different props shape
// (`data` divided proportionally across a fixed grid, no `orientation`),
// so it's rendered directly rather than through the shared `args` above —
// same reasoning as BarChart's clustered/stacked stories.
export const Percentage: Story = {
  name: "Percentage of a whole (10×10 grid, up to ~5 categories)",
  render: () => (
    <div style={{ width: "16rem" }}>
      <IconChart
        variant="percentage"
        icon={icons.User}
        data={HEADCOUNT_DATA}
        iconSize={16}
        gap={2}
        unitValue={2.1}
        unitLabel={(unitValue) => `≈ ${unitValue} people per icon`}
      />
    </div>
  ),
};

export const PercentageCustomColumns: Story = {
  name: "Percentage, custom column count",
  render: () => (
    <div style={{ width: "20rem" }}>
      <IconChart variant="percentage" icon={icons.User} data={HEADCOUNT_DATA} columns={14} iconSize={16} gap={2} />
    </div>
  ),
};
