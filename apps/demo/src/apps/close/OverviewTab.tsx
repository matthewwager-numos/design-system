import { ArrowRight } from "lucide-react";
import { Avatar, AvatarGroup, BarChart, Button, DisplayMetric, DonutChart, GanttChart, ProgressBar } from "@numosai/ui";
import type { DisplayMetricColor, GanttGroup, GanttMilestone } from "@numosai/ui";
import { useTasks } from "../../data/useTasks";
import { ASSIGNEES, STAGES } from "../../data/tasks";
import { DAYS_UNTIL_CLOSE, closeBadgeStatus } from "../../data/close";
import type { CloseAppTab } from "./CloseApp";

export interface OverviewTabProps {
  onNavigate: (tab: CloseAppTab) => void;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// The same fictional "today" the nav badge counts down from (see
// `data/close.ts`) — every date below, including the "Close" milestone
// itself, is derived from this one anchor plus `DAYS_UNTIL_CLOSE`, so the
// calendar and the badge can never drift out of sync with each other.
const TODAY = new Date(2026, 8, 29);
const CLOSE_DATE = addDays(TODAY, DAYS_UNTIL_CLOSE);

// One phase per app that actually feeds Close (see CloseApp's own doc
// comment) plus Close's own final two steps — an owner per phase, reusing
// this board's real assignee pool for continuity with the Close tab below.
const PHASES = [
  { id: "collect", label: "Collect", assignee: "Maya Chen", task: "AR cutoff & invoicing", start: -5, end: -3 },
  { id: "pay", label: "Pay", assignee: "Jordan Lee", task: "AP cutoff", start: -4, end: -2 },
  { id: "accruals", label: "Accrue", assignee: "Priya Patel", task: "Accrual review", start: -3, end: -1 },
  { id: "reconcile", label: "Reconcile", assignee: "Alex Kim", task: "Bank & GL reconciliation", start: -5, end: 0 },
] as const;

const CLOSE_PHASE = { id: "close", label: "Close", assignee: "Sam Rivera" } as const;

const CLOSE_CALENDAR_GROUPS: GanttGroup[] = [
  ...PHASES.map((phase) => ({
    id: phase.id,
    label: phase.label,
    icon: <Avatar name={phase.assignee} size="xs" />,
    tasks: [{ id: `${phase.id}-task`, label: phase.task, start: isoDate(addDays(TODAY, phase.start)), end: isoDate(addDays(TODAY, phase.end)) }],
  })),
  {
    id: CLOSE_PHASE.id,
    label: CLOSE_PHASE.label,
    icon: <Avatar name={CLOSE_PHASE.assignee} size="xs" />,
    tasks: [
      { id: "close-consolidate", label: "Consolidate & review", start: isoDate(addDays(TODAY, -1)), end: isoDate(TODAY) },
      { id: "close-signoff", label: "Sign-off & lock", start: isoDate(TODAY), end: isoDate(CLOSE_DATE) },
    ],
  },
];

const CALENDAR_ASSIGNEES = [...PHASES.map((phase) => phase.assignee), CLOSE_PHASE.assignee];

function closeMetricColor(status: ReturnType<typeof closeBadgeStatus>): DisplayMetricColor {
  if (status === "negative") return "magenta";
  if (status === "notice") return "yellow";
  return "brand";
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { tasks } = useTasks();
  const reconciled = tasks.filter((task) => task.stage === "reconciled").length;
  const inReview = tasks.filter((task) => task.stage === "inReview").length;
  const reconciledPercent = tasks.length === 0 ? 0 : Math.round((reconciled / tasks.length) * 100);

  const byStage = STAGES.map((stage) => ({
    label: stage.label,
    value: tasks.filter((task) => task.stage === stage.id).length,
  }));

  // Load balancing across the board — who's carrying the most open work,
  // not just how much work exists in total. Excludes UNASSIGNED: an
  // unclaimed backlog ticket isn't load on any one person.
  const byAssignee = ASSIGNEES.map((assignee) => ({
    label: assignee,
    value: tasks.filter((task) => task.assignee === assignee).length,
  })).sort((a, b) => b.value - a.value);

  const milestones: GanttMilestone[] = [
    {
      date: isoDate(CLOSE_DATE),
      label: "Close",
      popoverTitle: "Close",
      popoverContent: (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "16rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-paragraph-s-medium)" }}>
            <span>Books lock at end of day</span>
            <span style={{ color: "var(--content-positive)" }}>
              {reconciled} of {tasks.length} reconciled
            </span>
          </div>
          <ProgressBar value={reconciledPercent} mode="positive" showValue={false} />
          <AvatarGroup>
            {CALENDAR_ASSIGNEES.map((name) => (
              <Avatar key={name} name={name} size="sm" />
            ))}
          </AvatarGroup>
        </div>
      ),
    },
  ];

  return (
    <div className="page page--full-width">
      <div className="overview-metrics">
        <DisplayMetric value={`${DAYS_UNTIL_CLOSE}d`} label="Days to close" color={closeMetricColor(closeBadgeStatus(DAYS_UNTIL_CLOSE))} />
        <DisplayMetric value={String(tasks.length)} label="Total tasks" color="brand" />
        <DisplayMetric value={String(inReview)} label="In Review" color="yellow" />
        <DisplayMetric value={String(reconciled)} label="Reconciled" color="green" />
      </div>

      <div className="overview-section">
        <div className="overview-section-header">
          <h2 className="overview-section-title">Close calendar</h2>
          <div className="overview-section-actions">
            <Button variant="link" trailingIcon={<ArrowRight size={16} />} onClick={() => onNavigate("tasks")}>
              Open Close tasks
            </Button>
            <Button variant="link" trailingIcon={<ArrowRight size={16} />} onClick={() => onNavigate("history")}>
              View history
            </Button>
          </div>
        </div>
        <div className="overview-chart-card">
          <GanttChart groups={CLOSE_CALENDAR_GROUPS} milestones={milestones} labelWidth="10rem" />
        </div>
      </div>

      <div className="overview-section">
        <h2 className="overview-section-title">Breakdown</h2>
        <div className="overview-chart-row">
          <div className="overview-chart-card">
            <h3 className="overview-chart-card__title">By assignee</h3>
            <p className="overview-chart-card__description">Open tickets currently on each person's plate</p>
            <BarChart data={byAssignee} orientation="horizontal" height={220} />
          </div>
          <div className="overview-chart-card overview-chart-card--donut">
            <h3 className="overview-chart-card__title">By stage</h3>
            <DonutChart data={byStage} centerValue={String(tasks.length)} centerLabel="Tickets" size={200} thickness={11} />
          </div>
        </div>
      </div>
    </div>
  );
}
