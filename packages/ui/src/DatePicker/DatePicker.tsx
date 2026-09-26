import { useState } from "react";
import { clsx } from "clsx";
import { Select } from "../Select";
import "./DatePicker.css";

export type DatePickerMode = "single" | "range";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DatePickerProps {
  /** "single" (default) picks one date via `value`/`onChange`. "range" picks a start/end pair via `rangeValue`/`onRangeChange`, rendering Figma's own connected Start/Middle/End pill across the span. */
  mode?: DatePickerMode;
  /** `mode="single"` only. Omit to let the picker manage its own selection. */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** `mode="range"` only. Omit to let the picker manage its own selection. */
  rangeValue?: DateRange;
  defaultRangeValue?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  /** Which month is shown (any `Date` within it — only the year/month are read). Omit to let the picker manage its own — it starts from `value`/`rangeValue.start`, or today if neither is set. */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** A date the predicate returns `true` for can't be picked — shown in the "disabled" state (see Figma) instead of "enabled". */
  isDateDisabled?: (date: Date) => boolean;
  /** Which column the week starts on. Defaults to `0` (Sunday), matching Figma's own S M T W R F S header. */
  weekStartsOn?: 0 | 1;
  className?: string;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "R", "F", "S"] as const;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTH_OPTIONS = MONTH_LABELS.map((label, index) => ({ value: String(index), label }));

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// Years within this window of the *currently displayed* month always
// include whatever's shown, however far someone's already navigated — a
// fixed window relative to today would silently run out.
function yearOptions(viewYear: number): { value: string; label: string }[] {
  const options = [];
  for (let year = viewYear + 10; year >= viewYear - 100; year--) {
    options.push({ value: String(year), label: String(year) });
  }
  return options;
}

type DayCellType = "enabled" | "disabled" | "selected" | "start" | "middle" | "end";

const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

interface DayCellProps {
  date: Date;
  type: DayCellType;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
}

function DayCell({ date, type, onSelect, onHover }: DayCellProps) {
  const disabled = type === "disabled";
  return (
    <button
      type="button"
      className={clsx("ds-date-picker__day", `ds-date-picker__day--${type}`)}
      disabled={disabled}
      aria-pressed={type === "selected" || type === "start" || type === "end" ? true : undefined}
      aria-label={DAY_FORMATTER.format(date)}
      onClick={() => onSelect(date)}
      onMouseEnter={() => onHover(date)}
      onFocus={() => onHover(date)}
    >
      {date.getDate()}
    </button>
  );
}

/**
 * A month-grid date picker — matches the reference design's own Datepicker
 * exactly: two compact `<Select size="sm">`s for month/year navigation (the
 * same component `<Select>` already is elsewhere, not a one-off dropdown),
 * a weekday header row, and a 7-column day grid. Framed by design as
 * content for a date input's own dropdown — it has no border/shadow/
 * background of its own (unlike `<DropdownMenuPanel>`), since it's meant to
 * sit *inside* one of those, not stand alone as its own popover.
 *
 * `mode="range"` previews the would-be range while hovering (or
 * keyboard-focusing) a date after picking a start but before picking an
 * end — a real, expected range-picker convenience, even though it's not a
 * state Figma's own static reference shows directly; the confirmed Start/
 * Middle/End tokens are what render it.
 *
 * Each day is a real, individually tabbable `<button>` (native Enter/Space
 * selection for free) rather than a `role="grid"` with roving tabindex and
 * arrow-key navigation between cells — a real gap against the full WAI-ARIA
 * "Date Picker Dialog" pattern, flagged here rather than silently claiming
 * more coverage than this actually has.
 */
export function DatePicker({
  mode = "single",
  value: controlledValue,
  defaultValue = null,
  onChange,
  rangeValue: controlledRangeValue,
  defaultRangeValue = { start: null, end: null },
  onRangeChange,
  month: controlledMonth,
  defaultMonth,
  onMonthChange,
  isDateDisabled,
  weekStartsOn = 0,
  className,
}: DatePickerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const [uncontrolledRange, setUncontrolledRange] = useState(defaultRangeValue);
  const range = controlledRangeValue ?? uncontrolledRange;

  const initialMonth = defaultMonth ?? value ?? range.start ?? new Date();
  const [uncontrolledMonth, setUncontrolledMonth] = useState(startOfMonth(initialMonth));
  const viewMonth = controlledMonth ? startOfMonth(controlledMonth) : uncontrolledMonth;

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  function setMonth(next: Date) {
    setUncontrolledMonth(next);
    onMonthChange?.(next);
  }

  function handleSelect(date: Date) {
    if (mode === "range") {
      const { start, end } = range;
      let next: DateRange;
      if (!start || end) {
        next = { start: date, end: null };
      } else if (date < start) {
        next = { start: date, end: null };
      } else {
        next = { start, end: date };
      }
      setUncontrolledRange(next);
      onRangeChange?.(next);
    } else {
      setUncontrolledValue(date);
      onChange?.(date);
    }
  }

  function getCellType(date: Date): DayCellType {
    if (isDateDisabled?.(date)) return "disabled";
    if (mode === "single") {
      return value && isSameDay(date, value) ? "selected" : "enabled";
    }
    const { start } = range;
    const previewEnd = range.end ?? (start && hoverDate && hoverDate > start ? hoverDate : null);
    if (!start) return "enabled";
    if (!previewEnd || isSameDay(start, previewEnd)) {
      return isSameDay(date, start) ? "selected" : "enabled";
    }
    if (isSameDay(date, start)) return "start";
    if (isSameDay(date, previewEnd)) return "end";
    if (date > start && date < previewEnd) return "middle";
    return "enabled";
  }

  const weekdayLabels = weekStartsOn === 1 ? [...WEEKDAY_LABELS.slice(1), WEEKDAY_LABELS[0]] : WEEKDAY_LABELS;

  const firstWeekday = (startOfMonth(viewMonth).getDay() - weekStartsOn + 7) % 7;
  const totalDays = daysInMonth(viewMonth);
  const days = Array.from({ length: totalDays }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1));
  const leadingBlanks = Array.from({ length: firstWeekday });

  return (
    <div className={clsx("ds-date-picker", className)}>
      <div className="ds-date-picker__head">
        <Select
          size="sm"
          aria-label="Month"
          options={[...MONTH_OPTIONS]}
          value={String(viewMonth.getMonth())}
          onChange={(next) => setMonth(new Date(viewMonth.getFullYear(), Number(next), 1))}
        />
        <Select
          size="sm"
          aria-label="Year"
          options={yearOptions(viewMonth.getFullYear())}
          value={String(viewMonth.getFullYear())}
          onChange={(next) => setMonth(new Date(Number(next), viewMonth.getMonth(), 1))}
        />
      </div>

      <div className="ds-date-picker__days" onMouseLeave={() => setHoverDate(null)}>
        {weekdayLabels.map((label, index) => (
          <span className="ds-date-picker__weekday" aria-hidden key={index}>
            {label}
          </span>
        ))}
        {leadingBlanks.map((_, index) => (
          <span className="ds-date-picker__day ds-date-picker__day--blank" key={`blank-${index}`} aria-hidden />
        ))}
        {days.map((date) => (
          <DayCell key={date.getDate()} date={date} type={getCellType(date)} onSelect={handleSelect} onHover={setHoverDate} />
        ))}
      </div>
    </div>
  );
}
