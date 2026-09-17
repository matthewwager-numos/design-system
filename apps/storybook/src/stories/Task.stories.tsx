import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Task, TaskList } from "@numosai/ui";
import type { TaskState } from "@numosai/ui";

const meta: Meta<typeof Task> = {
  title: "Components/Task",
  component: Task,
  // No "autodocs" tag — Task.mdx is this component's docs page.
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Task>;

const PREVIEW_STYLE = { width: "22rem", maxWidth: "100%" };

export const Disabled: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Task state="disabled" title="Verify sales tax remittance" description="Confirm against filed returns" meta="Locked" />
    </div>
  ),
};

export const NotStarted: Story = {
  name: "Not started",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Task
        state="notStarted"
        title="Reconcile merchant processor fees"
        description="Match processor statements to recorded fee expense"
        meta="Due in 5d"
        actionLabel="Start"
        onAction={() => alert("Start clicked")}
      />
    </div>
  ),
};

export const InProgress: Story = {
  name: "In progress",
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Task
        state="inProgress"
        title="Audit expense report receipts"
        description="Spot-check receipts over $500 for policy compliance"
        meta="3 of 4 done"
        actionLabel="Continue"
        onAction={() => alert("Continue clicked")}
      />
    </div>
  ),
};

export const Overdue: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Task
        state="overdue"
        title="Investigate unmatched wire transfer"
        description="Trace a $12,400 wire with no matching invoice"
        meta="1d overdue!"
        actionLabel="Start"
        onAction={() => alert("Start clicked")}
      />
    </div>
  ),
};

export const Complete: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Task
        state="complete"
        title="Match Stripe payouts to bank deposits"
        description="January settlement batch reconciliation"
        meta="3d ago"
        actionLabel="Review"
        onAction={() => alert("Review clicked")}
      />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <Task
        state="error"
        title="Reconcile payroll tax withholdings"
        description="Verify Q4 withholding matches the filed 941"
        meta="Due in 5d"
        actionLabel="Fix"
        onAction={() => alert("Fix clicked")}
      />
    </div>
  ),
};

const STEPS: { title: string; description: string }[] = [
  { title: "Connect your bank account", description: "Link at least one account to start importing transactions" },
  { title: "Invite your team", description: "Add teammates so work can be assigned and reviewed" },
  { title: "Set your close calendar", description: "Choose which day each month the books close" },
  { title: "Review your chart of accounts", description: "Confirm accounts map correctly before the first close" },
];

function TaskListDemo() {
  const [completed, setCompleted] = useState(0);

  function stateFor(index: number): TaskState {
    if (index < completed) return "complete";
    if (index === completed) return "notStarted";
    return "disabled";
  }

  return (
    <div style={{ width: "26rem", maxWidth: "100%" }}>
      <TaskList title="Get set up" description="Finish these steps to start closing your books with Numos.">
        {STEPS.map((step, index) => {
          const state = stateFor(index);
          return (
            <Task
              key={step.title}
              state={state}
              title={step.title}
              description={step.description}
              meta={state === "complete" ? "Done" : state === "disabled" ? "Locked" : undefined}
              actionLabel={state === "notStarted" ? "Start" : undefined}
              onAction={() => setCompleted((prev) => prev + 1)}
            />
          );
        })}
      </TaskList>
    </div>
  );
}

export const List: Story = {
  name: "TaskList — sequential onboarding steps",
  render: () => <TaskListDemo />,
};
