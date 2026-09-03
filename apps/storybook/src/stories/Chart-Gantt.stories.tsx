import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarGroup, GanttChart, ProgressBar } from "@numosai/ui";
import type { GanttGroup } from "@numosai/ui";

// One phase, one owner — Jun 2 is the shared close deadline (see the
// "Close" milestone below), tucked between May 31 and Jun 1.
const PHASES = [
  { id: "prepare", label: "Prepare", start: "2026-05-29", end: "2026-05-30", assignee: "Michael Thomas" },
  { id: "record", label: "Record", start: "2026-05-30", end: "2026-05-31", assignee: "Tyrod Taylor" },
  { id: "reconcile", label: "Reconcile", start: "2026-05-31", end: "2026-06-01", assignee: "Frank Gibson" },
  { id: "review", label: "Review", start: "2026-06-01", end: "2026-06-02", assignee: "Tony Tiger" },
  { id: "finalize", label: "Finalize", start: "2026-06-02", end: "2026-06-02", assignee: "Sam Toucan" },
] as const;
const SUBTASKS = ["Sync data", "Validate completion", "Prepare schedules"];

function subtasks(phase: (typeof PHASES)[number]) {
  return SUBTASKS.map((subtask, i) => ({
    id: `${phase.id}-${i}`,
    label: subtask,
    // Each subtask's own slice of the phase's window — the first and last
    // land right on the phase's own start/end, the middle one spans the
    // whole thing.
    start: i === 2 ? phase.end : phase.start,
    end: i === 0 ? phase.start : phase.end,
  }));
}

const GROUPS: GanttGroup[] = PHASES.map((phase) => ({
  id: phase.id,
  label: phase.label,
  tasks: subtasks(phase),
}));

// No `component: GanttChart` — its real props (popoverContent/popoverTitle/
// popoverActions/icon) are ReactNode, spread across
// interfaces that extend each other and nest in arrays (GanttGroup.tasks:
// GanttTask[], both extending GanttPopover). react-docgen's static prop-
// type analysis recurses into that shape (ReactNode's own type is
// self-referential via Iterable<ReactNode>) and blows the call stack —
// same reasoning as Popover.stories.tsx's own PopoverPlayground wrapper,
// just without needing a wrapper here since there's no docs page relying
// on an auto-generated prop table for this component.
const meta: Meta<typeof GanttChart> = {
  title: "Components/Chart-Gantt",
  args: { groups: GROUPS },
};

export default meta;
type Story = StoryObj<typeof GanttChart>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "48rem" }}>
      <GanttChart {...args} />
    </div>
  ),
};

export const WithMilestone: Story = {
  name: "With a milestone column",
  args: { milestones: [{ date: "2026-05-31", label: "Close" }] },
  render: (args) => (
    <div style={{ width: "48rem" }}>
      <GanttChart {...args} />
    </div>
  ),
};

export const CollapsedGroups: Story = {
  name: "Collapsed groups",
  args: { defaultCollapsedGroups: ["prepare", "record"] },
  render: (args) => (
    <div style={{ width: "48rem" }}>
      <GanttChart {...args} />
    </div>
  ),
};

// A completion summary — the same "N of M tasks complete" + <ProgressBar>
// + <AvatarGroup> content, reused by every clickable bar/milestone below,
// just with a different date range and set of people each time.
function completionSummary(dateRange: string, done: number, total: number, people: string[]): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "16rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-paragraph-s-medium)" }}>
        <span>{dateRange}</span>
        <span style={{ color: "var(--content-positive)" }}>
          {done} of {total} tasks complete
        </span>
      </div>
      <ProgressBar value={(done / total) * 100} mode="positive" showValue={false} />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <AvatarGroup>
          {people.map((person) => (
            <Avatar key={person} name={person} size="sm" />
          ))}
        </AvatarGroup>
        <span style={{ font: "var(--type-paragraph-s-regular)", color: "var(--content-link-default)" }}>{people.join(", ")}</span>
      </div>
    </div>
  );
}

export const WithMilestonePopover: Story = {
  name: "Milestone with a Popover",
  render: (args) => (
    <div style={{ width: "48rem", minHeight: "26rem" }}>
      <GanttChart
        {...args}
        milestones={[
          {
            date: "2026-05-31",
            label: "Close",
            popoverTitle: "Lock & report",
            popoverContent: completionSummary("Jun 1 – Jun 2", 1, 4, PHASES.map((p) => p.assignee)),
          },
        ]}
      />
    </div>
  ),
};

function groupByTeam(): GanttGroup[] {
  return PHASES.map((phase) => ({
    id: phase.assignee,
    label: phase.assignee,
    // Each group's own heading gets a person's <Avatar> in place of the
    // default collapse chevron. Clicking the row still toggles collapse
    // either way. The bar itself falls back to the same plain label + date
    // range popover every other bar without custom content uses.
    icon: <Avatar name={phase.assignee} size="xs" />,
    tasks: subtasks(phase),
  }));
}

export const GroupedByTeam: Story = {
  name: "Grouped by team (avatars)",
  render: (args) => (
    <div style={{ width: "48rem", minHeight: "26rem" }}>
      <GanttChart {...args} groups={groupByTeam()} milestones={[{ date: "2026-05-31", label: "Close" }]} />
    </div>
  ),
};
