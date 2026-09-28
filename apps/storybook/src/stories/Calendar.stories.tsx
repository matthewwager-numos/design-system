import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@numosai/ui";
import type { CalendarDateStatus } from "@numosai/ui";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const MONTH = new Date(2026, 0, 1);

// A demo "close calendar" spread — a run of negative (overdue) days, a run
// of notice (in progress) days, and a couple of positive (done) days —
// matching the reference design's own example spread of statuses.
const STATUS_BY_DAY: Record<number, CalendarDateStatus> = {
  6: "negative",
  7: "negative",
  8: "negative",
  9: "negative",
  11: "negative",
  12: "notice",
  13: "notice",
  14: "notice",
  15: "notice",
  16: "positive",
  19: "positive",
  20: "positive",
};

function getDemoStatus(date: Date): CalendarDateStatus | undefined {
  return STATUS_BY_DAY[date.getDate()];
}

const DETAILS_BY_DAY: Record<number, string> = {
  6: "Bank feed import overdue — 2 accounts haven't synced since the 4th.",
  7: "Bank feed import overdue — 2 accounts haven't synced since the 4th.",
  8: "Bank feed import overdue — 2 accounts haven't synced since the 4th.",
  9: "Bank feed import overdue — 2 accounts haven't synced since the 4th.",
  11: "Payroll journal entry needs review before it can post.",
  12: "Reconciliation in progress — 3 of 5 accounts matched.",
  13: "Reconciliation in progress — 3 of 5 accounts matched.",
  14: "Reconciliation in progress — 3 of 5 accounts matched.",
  15: "Reconciliation in progress — 3 of 5 accounts matched.",
  16: "Books closed for this period.",
  19: "Books closed for this period.",
  20: "Books closed for this period.",
};

function getDemoDetails(date: Date) {
  return DETAILS_BY_DAY[date.getDate()];
}

export const Default: Story = {
  render: () => (
    <div style={{ width: "20rem" }}>
      <Calendar month={MONTH} />
    </div>
  ),
};

export const WithStatuses: Story = {
  name: "With date statuses",
  render: () => (
    <div style={{ width: "20rem" }}>
      <Calendar month={MONTH} getDateStatus={getDemoStatus} />
    </div>
  ),
};

export const Fluid: Story = {
  name: "Flexes with its container",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ width: "48rem" }}>
        <Calendar month={MONTH} getDateStatus={getDemoStatus} />
      </div>
      <div style={{ width: "26rem" }}>
        <Calendar month={MONTH} getDateStatus={getDemoStatus} />
      </div>
      <div style={{ width: "16rem" }}>
        <Calendar month={MONTH} getDateStatus={getDemoStatus} />
      </div>
    </div>
  ),
};

export const WithDetails: Story = {
  name: "Clickable — with date details",
  render: () => (
    <div style={{ width: "20rem", minHeight: "18rem" }}>
      <Calendar month={MONTH} getDateStatus={getDemoStatus} getDateDetails={getDemoDetails} />
    </div>
  ),
};

// Flags the real "today" with a status too, to show both halves of the
// today treatment at once: medium weight always, plus that status's own
// `--content-*` color overriding the plain emphasis color.
function getTodayStatus(date: Date): CalendarDateStatus | undefined {
  const today = new Date();
  const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  return isToday ? "notice" : undefined;
}

export const Today: Story = {
  name: "Highlights today",
  render: () => (
    <div style={{ width: "20rem" }}>
      <Calendar getDateStatus={getTodayStatus} />
    </div>
  ),
};

export const WeekStartsMonday: Story = {
  name: "weekStartsOn={1}",
  render: () => (
    <div style={{ width: "20rem" }}>
      <Calendar month={MONTH} getDateStatus={getDemoStatus} weekStartsOn={1} />
    </div>
  ),
};
