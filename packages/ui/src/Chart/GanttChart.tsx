import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { Popover } from "../Popover";
import { chartColor } from "./chartColors";
import "./GanttChart.css";

export interface GanttPopover {
  popoverContent?: ReactNode;
  popoverTitle?: ReactNode;
  popoverActions?: ReactNode;
}

export interface GanttTask extends GanttPopover {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface GanttGroup extends GanttPopover {
  id: string;
  label: string;
  tasks: GanttTask[];
  color?: string;
  /**
   * Replaces the default collapse chevron with a custom icon — e.g. a
   * person's `<Avatar>` when grouping by team instead of by stage. The
   * label button is still the click target that toggles collapse either
   * way; this only swaps what's drawn at its leading edge.
   */
  icon?: ReactNode;
}

export interface GanttMilestone extends GanttPopover {
  date: string;
  label: string;
}

export interface GanttChartProps {
  groups: GanttGroup[];
  milestones?: GanttMilestone[];
  defaultCollapsedGroups?: string[];
  labelWidth?: string;
  className?: string;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

interface BarProps extends GanttPopover {
  label: string;
  start: string;
  end: string;
  color: string;
  rangeStart: Date;
  totalDays: number;
}

/**
 * Hoisted to module scope, not defined inside `GanttChart`'s render body —
 * a component defined inline gets a fresh function identity every render,
 * which React treats as a different component type and fully remounts
 * (losing focus DOM state every time). All context it needs comes in as
 * explicit props instead of a closure.
 *
 * Every bar opens a `<Popover>` on click — a plain label + date range by
 * default, or `popoverContent`/`popoverTitle` in place of those when a
 * consumer supplies them (e.g. a completion summary). There's no separate
 * hover tooltip: it duplicated the popover's own info without adding
 * anything, and the two competed for the same click.
 */
function Bar({ label, start, end, color, rangeStart, totalDays, popoverContent, popoverTitle, popoverActions }: BarProps) {
  const leftFraction = daysBetween(rangeStart, parseISODate(start)) / totalDays;
  const widthFraction = (daysBetween(parseISODate(start), parseISODate(end)) + 1) / totalDays;
  const dateRange = `${dateFormatter.format(parseISODate(start))} – ${dateFormatter.format(parseISODate(end))}`;

  // The track is inset from the timeline's own edges by --space-2 (see
  // .ds-gantt-chart__track) — the bar's own position box sits inside that
  // same inset span, not the full timeline width, so a bar starting on day
  // one or ending on the last day lines up with the track's rounded edge
  // instead of poking past it.
  const insetSpan = "(100% - 2 * var(--space-2))";

  return (
    <div className="ds-gantt-chart__timeline" style={{ ["--ds-gantt-columns" as string]: totalDays }}>
      <div className="ds-gantt-chart__track" />
      <div
        className="ds-gantt-chart__bar-position"
        style={{
          left: `calc(var(--space-2) + ${leftFraction} * ${insetSpan})`,
          width: `calc(${widthFraction} * ${insetSpan})`,
        }}
      >
        <Popover title={popoverTitle ?? label} content={popoverContent ?? dateRange} actions={popoverActions} placement="bottom">
          <div className="ds-gantt-chart__bar" style={{ background: color }} tabIndex={0} role="img" aria-label={`${label}: ${dateRange}`} />
        </Popover>
      </div>
    </div>
  );
}

/**
 * A collapsible task timeline — each group (a stage, a workstream) rolls up
 * its own sub-tasks into one summary bar spanning their combined range, and
 * expands to show each sub-task's own bar. Built from real HTML/CSS grid
 * rows (a label column + a timeline column), not SVG — every row needs its
 * own clickable label and hover target.
 *
 * The date range isn't configured — it's derived as the min/max across
 * every task's own `start`/`end`, one column per calendar day.
 */
export function GanttChart({ groups, milestones = [], defaultCollapsedGroups = [], labelWidth = "12rem", className }: GanttChartProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(defaultCollapsedGroups));

  const allTasks = groups.flatMap((g) => g.tasks);
  if (allTasks.length === 0) return null;

  const rangeStart = allTasks.reduce((min, t) => (parseISODate(t.start) < min ? parseISODate(t.start) : min), parseISODate(allTasks[0]!.start));
  const rangeEnd = allTasks.reduce((max, t) => (parseISODate(t.end) > max ? parseISODate(t.end) : max), parseISODate(allTasks[0]!.end));
  const totalDays = daysBetween(rangeStart, rangeEnd) + 1;
  const columns = Array.from({ length: totalDays }, (_, i) => addDays(rangeStart, i));
  const milestoneByDate = new Map(milestones.map((m) => [m.date, m]));

  function toggleGroup(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className={clsx("ds-gantt-chart", className)} style={{ ["--ds-gantt-label-width" as string]: labelWidth }}>
      <div className="ds-gantt-chart__header">
        <div className="ds-gantt-chart__header-spacer" />
        <div className="ds-gantt-chart__timeline" style={{ ["--ds-gantt-columns" as string]: totalDays }}>
          {columns.map((date) => {
            const milestone = milestoneByDate.get(toISODate(date));
            const cell = (
              <span className={clsx("ds-gantt-chart__header-cell", milestone && "ds-gantt-chart__header-cell--milestone")}>
                {milestone ? milestone.label : dateFormatter.format(date)}
              </span>
            );
            return (
              <div className="ds-gantt-chart__header-column" key={toISODate(date)}>
                {milestone?.popoverContent ? (
                  <Popover title={milestone.popoverTitle} content={milestone.popoverContent} actions={milestone.popoverActions} placement="bottom">
                    <button type="button" className="ds-gantt-chart__milestone-trigger">
                      {cell}
                    </button>
                  </Popover>
                ) : (
                  cell
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ds-gantt-chart__body">
        {groups.map((group, index) => {
          const color = group.color ?? chartColor(index);
          const isCollapsed = collapsed.has(group.id);
          const groupStart = group.tasks.reduce((min, t) => (t.start < min ? t.start : min), group.tasks[0]?.start ?? toISODate(rangeStart));
          const groupEnd = group.tasks.reduce((max, t) => (t.end > max ? t.end : max), group.tasks[0]?.end ?? toISODate(rangeStart));
          return (
            <div key={group.id}>
              <div className="ds-gantt-chart__row ds-gantt-chart__row--group">
                <button type="button" className="ds-gantt-chart__label-button" aria-expanded={!isCollapsed} onClick={() => toggleGroup(group.id)}>
                  {group.icon ?? (
                    <ChevronDown size={16} className={clsx("ds-gantt-chart__chevron", isCollapsed && "ds-gantt-chart__chevron--collapsed")} aria-hidden />
                  )}
                  <span className="ds-gantt-chart__label ds-gantt-chart__label--group">{group.label}</span>
                </button>
                <Bar
                  label={group.label}
                  start={groupStart}
                  end={groupEnd}
                  color={color}
                  rangeStart={rangeStart}
                  totalDays={totalDays}
                  popoverContent={group.popoverContent}
                  popoverTitle={group.popoverTitle}
                  popoverActions={group.popoverActions}
                />
              </div>

              {!isCollapsed &&
                group.tasks.map((task) => (
                  <div className="ds-gantt-chart__row" key={task.id}>
                    <span className="ds-gantt-chart__label">{task.label}</span>
                    <Bar
                      label={task.label}
                      start={task.start}
                      end={task.end}
                      color={color}
                      rangeStart={rangeStart}
                      totalDays={totalDays}
                      popoverContent={task.popoverContent}
                      popoverTitle={task.popoverTitle}
                      popoverActions={task.popoverActions}
                    />
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
