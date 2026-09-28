import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Popover } from "../Popover";
import "./Calendar.css";

export type CalendarDateStatus = "default" | "negative" | "notice" | "positive";

export interface CalendarProps {
  /** Which month to render — only the year/month are read, day/time are ignored. Defaults to the current month. */
  month?: Date;
  /** Returns a date's status — omit, or return `undefined`/`"default"`, for the plain, unhighlighted cell. Called once per visible day in the month, not for the leading blank cells. */
  getDateStatus?: (date: Date) => CalendarDateStatus | undefined;
  /**
   * Returns the popover body content for a date — clicking that day then
   * opens a `<Popover>` titled with the full date, showing this. Return
   * `null`/`undefined` (or omit the whole prop) to leave a day as a plain,
   * non-interactive cell — a day with nothing to say doesn't get a dead
   * click target that opens an empty popover.
   */
  getDateDetails?: (date: Date) => ReactNode | null | undefined;
  /** Which column the week starts on. Defaults to `0` (Sunday), matching Figma's own S M T W R F S header. */
  weekStartsOn?: 0 | 1;
  className?: string;
}

const WEEKDAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAY_LETTER = ["S", "M", "T", "W", "R", "F", "S"] as const;

const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function rotate<T>(labels: readonly [T, T, T, T, T, T, T], weekStartsOn: 0 | 1): T[] {
  const [first, ...rest] = labels;
  return weekStartsOn === 1 ? [...rest, first] : [...labels];
}

interface CalendarDayCellProps {
  date: Date;
  status: CalendarDateStatus;
  details: ReactNode | null | undefined;
  isToday: boolean;
}

function CalendarDayCell({ date, status, details, isToday }: CalendarDayCellProps) {
  const className = clsx(
    "ds-calendar__day",
    `ds-calendar__day--${status}`,
    details != null && "ds-calendar__day--interactive",
    isToday && "ds-calendar__day--today",
  );
  const day = date.getDate();

  if (details == null) {
    return <div className={className}>{day}</div>;
  }

  return (
    <Popover title={DAY_FORMATTER.format(date)} content={details}>
      <button type="button" className={className}>
        {day}
      </button>
    </Popover>
  );
}

/**
 * A month-grid *display* calendar — matches Figma's own Calendar exactly: a
 * weekday header and a 7-column day grid, each day optionally highlighted
 * with a status color (e.g. a deadline, a warning, a completed item).
 * Clicking a day with details (`getDateDetails`) opens a `<Popover>` titled
 * with the full date; a day with nothing to say stays a plain,
 * non-interactive cell. For *picking* a date instead of viewing one, use
 * `<DatePicker>` — this is for showing a month at a glance, the way a Close
 * calendar or deadline overview would, with details on demand.
 *
 * Every dimension is fluid: the grid uses `fr` columns/rows so it stretches
 * to fill whatever box it's given (an `aspect-ratio` matching Figma's own
 * reference proportions is the default height, but any container that sets
 * its own height wins instead, same as `<DatePicker>`'s cells scaling to a
 * fixed size — here it's the box that's fixed, not the cell size within it).
 *
 * The weekday header abbreviates as the component's own width shrinks (a
 * container query, not a viewport one — this can sit in a narrow sidebar on
 * a wide screen same as an actual phone): full name, then a 3-letter
 * abbreviation, then a single letter, matching `<DatePicker>`'s own S M T W
 * R F S convention at the narrowest tier.
 *
 * Whichever day matches the real current date always renders medium-weight,
 * in the emphasis color — or, if that day also carries a status, that
 * status's own `--content-*` color instead of the plain emphasis one, so
 * "today" and "today, and it's overdue" both read clearly rather than
 * fighting each other.
 */
export function Calendar({ month = new Date(), getDateStatus, getDateDetails, weekStartsOn = 0, className }: CalendarProps) {
  const viewMonth = startOfMonth(month);
  const weekdayFull = rotate(WEEKDAY_FULL, weekStartsOn);
  const weekdayAbbr = rotate(WEEKDAY_ABBR, weekStartsOn);
  const weekdayLetter = rotate(WEEKDAY_LETTER, weekStartsOn);

  const firstWeekday = (viewMonth.getDay() - weekStartsOn + 7) % 7;
  const totalDays = daysInMonth(viewMonth);
  const days = Array.from({ length: totalDays }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1));
  const leadingBlanks = Array.from({ length: firstWeekday });
  const today = new Date();

  return (
    <div className={clsx("ds-calendar", className)}>
      {weekdayFull.map((full, index) => (
        <div className="ds-calendar__weekday" aria-hidden key={index}>
          <span className="ds-calendar__weekday-full">{full}</span>
          <span className="ds-calendar__weekday-abbr">{weekdayAbbr[index]}</span>
          <span className="ds-calendar__weekday-letter">{weekdayLetter[index]}</span>
        </div>
      ))}
      {leadingBlanks.map((_, index) => (
        <span className="ds-calendar__day ds-calendar__day--blank" key={`blank-${index}`} aria-hidden />
      ))}
      {days.map((date) => (
        <CalendarDayCell
          key={date.getDate()}
          date={date}
          status={getDateStatus?.(date) ?? "default"}
          details={getDateDetails?.(date)}
          isToday={isSameDay(date, today)}
        />
      ))}
    </div>
  );
}
