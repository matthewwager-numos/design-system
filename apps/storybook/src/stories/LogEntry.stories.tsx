import type { Meta, StoryObj } from "@storybook/react";
import { LogEntry } from "@numosai/ui";

// Figma's own reference frame is 447px wide and fits this file's sample
// sentences exactly — but with PP Neue Montreal unavailable here (falls
// back to --font-sans, same known gap noted in Button.css), the fallback
// renders very slightly wider, so this needs a bit more room to stay on
// one line for a clean "Default" demo. LongDescription below uses its own,
// deliberately narrower width instead, to actually demonstrate truncation.
const PREVIEW_STYLE = { width: "32rem" };

const meta: Meta<typeof LogEntry> = {
  title: "Components/LogEntry",
  component: LogEntry,
  argTypes: {
    subject: { control: "text" },
    description: { control: "text" },
    actor: { control: "text" },
    timestamp: { control: "text" },
  },
  args: {
    subject: "Mary Jane’s",
    description: "employment status changed from full-time to part-time",
    actor: "John Doe",
    timestamp: "Sep 15, 2026 at 3:45p PST",
  },
};

export default meta;
type Story = StoryObj<typeof LogEntry>;

export const Default: Story = {
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <LogEntry {...args} />
    </div>
  ),
};

export const WithoutASubject: Story = {
  name: "Without a subject",
  args: {
    subject: undefined,
    description: "Monthly report was generated",
    actor: "System",
  },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <LogEntry {...args} />
    </div>
  ),
};

// Stacking entries directly (no gap) is what produces the continuous
// connecting timeline — each entry's own flexible bottom rail segment
// lines up with the next entry's fixed top stub.
export const Stacked: Story = {
  render: () => (
    <div style={PREVIEW_STYLE}>
      <LogEntry
        subject="Mary Jane’s"
        description="employment status changed from full-time to part-time"
        actor="John Doe"
        timestamp="Sep 15, 2026 at 3:45p PST"
      />
      <LogEntry subject="Alex Kim" description="was added to Engineering" actor="Mary Jane" timestamp="Sep 12, 2026 at 9:00a PST" />
      <LogEntry
        subject="Invoice #4021’s"
        description="status changed from Pending to Paid"
        actor="System"
        timestamp="Sep 10, 2026 at 6:00a PST"
      />
    </div>
  ),
};

export const LongDescription: Story = {
  name: "A long description (truncates)",
  args: {
    subject: "Acme Manufacturing Co.’s",
    description: "billing address changed from 100 Old Warehouse Rd, Suite 4B, Springfield, IL to 4400 Commerce Park Drive, Building C, Springfield, IL",
  },
  render: (args) => (
    <div style={PREVIEW_STYLE}>
      <LogEntry {...args} />
    </div>
  ),
};
