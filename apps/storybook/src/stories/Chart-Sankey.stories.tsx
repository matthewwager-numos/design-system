import type { Meta, StoryObj } from "@storybook/react";
import { SankeyChart } from "@numosai/ui";

const NODES = [
  { id: "visits", stage: 0 },
  { id: "signups", stage: 1 },
  { id: "bounced", stage: 1 },
  { id: "customers", stage: 2 },
  { id: "churned", stage: 2 },
];

const LINKS = [
  { source: "visits", target: "signups", value: 60, label: "Visits → Signups" },
  { source: "visits", target: "bounced", value: 40, label: "Visits → Bounced" },
  { source: "signups", target: "customers", value: 45, label: "Signups → Customers" },
  { source: "signups", target: "churned", value: 15, label: "Signups → Churned" },
];

const LEGEND = [
  { label: "Visits → Signups", color: "var(--chart-1)" },
  { label: "Visits → Bounced", color: "var(--chart-2)" },
  { label: "Signups → Customers", color: "var(--chart-3)" },
  { label: "Signups → Churned", color: "var(--chart-4)" },
];

const meta: Meta<typeof SankeyChart> = {
  title: "Components/Chart-Sankey",
  component: SankeyChart,
  // No "autodocs" tag — Chart-Sankey.mdx is this component's docs page.
  argTypes: {
    nodes: { control: false },
    links: { control: false },
    legend: { control: false },
  },
  args: {
    nodes: NODES,
    links: LINKS,
    legend: LEGEND,
    stageLabels: ["Visits", "Converted", "Outcome"],
    showStageLabels: true,
    showLegend: true,
  },
};

export default meta;
type Story = StoryObj<typeof SankeyChart>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <SankeyChart {...args} />
    </div>
  ),
};

export const StageLabelsHidden: Story = {
  name: "Stage labels hidden",
  args: { showStageLabels: false },
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <SankeyChart {...args} />
    </div>
  ),
};

export const LegendHidden: Story = {
  name: "Legend hidden",
  args: { showLegend: false },
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <SankeyChart {...args} />
    </div>
  ),
};

export const DefaultStageNumbers: Story = {
  name: "Default numeric stage labels",
  args: { stageLabels: undefined },
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <SankeyChart {...args} />
    </div>
  ),
};

export const OneColor: Story = {
  name: "One color",
  args: { color: "var(--chart-1)", legend: undefined, showLegend: false },
  render: (args) => (
    <div style={{ width: "28rem" }}>
      <SankeyChart {...args} />
    </div>
  ),
};

const FUNNEL_NODES = [
  { id: "backlog", stage: 0 },
  { id: "assigned", stage: 1 },
  { id: "droppedAfterBacklog", stage: 1, hidden: true },
  { id: "inProgress", stage: 2 },
  { id: "droppedAfterAssigned", stage: 2, hidden: true },
  { id: "inReview", stage: 3 },
  { id: "droppedAfterInProgress", stage: 3, hidden: true },
  { id: "reconciled", stage: 4 },
  { id: "droppedAfterInReview", stage: 4, hidden: true },
];

const FUNNEL_LINKS = [
  { source: "backlog", target: "assigned", value: 20, label: "Backlog → Assigned" },
  { source: "backlog", target: "droppedAfterBacklog", value: 5, label: "Dropped after Backlog" },
  { source: "assigned", target: "inProgress", value: 15, label: "Assigned → In Progress" },
  { source: "assigned", target: "droppedAfterAssigned", value: 5, label: "Dropped after Assigned" },
  { source: "inProgress", target: "inReview", value: 10, label: "In Progress → In Review" },
  { source: "inProgress", target: "droppedAfterInProgress", value: 5, label: "Dropped after In Progress" },
  { source: "inReview", target: "reconciled", value: 5, label: "In Review → Reconciled" },
  { source: "inReview", target: "droppedAfterInReview", value: 5, label: "Dropped after In Review" },
];

export const BranchingFunnel: Story = {
  name: "Branching drop-off funnel (hidden nodes)",
  args: {
    nodes: FUNNEL_NODES,
    links: FUNNEL_LINKS,
    legend: undefined,
    showLegend: false,
    showStageLabels: true,
    stageLabels: ["Backlog", "Assigned", "In Progress", "In Review", "Reconciled"],
    color: "var(--chart-2)",
    nodeWidth: 8,
    stageAlign: "centers",
  },
  render: (args) => (
    <div style={{ width: "40rem" }}>
      <SankeyChart {...args} />
    </div>
  ),
};
