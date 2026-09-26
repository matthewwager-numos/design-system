import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { Calendar, Check, TriangleAlert } from "lucide-react";
import { clsx } from "clsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuPanel } from "../DropdownMenu";
import { FieldLabel } from "../FieldLabel";
import { DatePicker } from "../DatePicker";
import "./DateInput.css";

export type DateInputSize = "sm" | "md" | "lg";
export type DateInputStatus = "default" | "error" | "success";

// Matches the reference design's own per-size padding *and* radius around
// the embedded calendar (confirmed against all three of Figma's paired
// "Dropdown" frames, not just the "lg" one) — not `<DropdownMenuPanel>`'s
// own built-in size tiers, which step 8/12/16px padding and use a flat
// radius-md for its own "sm". These happen to land on the exact same
// radius steps as `<TextInput>`'s own lg/md/sm scale, which is why they
// look like a match for that scale rather than the panel's.
const PANEL_STYLE: Record<DateInputSize, { padding: string; borderRadius: string }> = {
  sm: { padding: "var(--space-1)", borderRadius: "var(--radius-sm)" },
  md: { padding: "var(--space-2)", borderRadius: "var(--radius-md)" },
  lg: { padding: "var(--space-3)", borderRadius: "var(--radius-lg)" },
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date): string {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${date.getFullYear()}`;
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Accepts typed "M/D/YYYY" (any mix of "/" or "-", flexible digit widths,
// a full 4-digit year required — no 2-digit-year century guessing). Rejects
// calendar-invalid dates like "02/30/2026" instead of letting `Date` roll
// them over into March.
function parseTypedDate(text: string): Date | null {
  const match = text.trim().match(/^(\d{1,2})\s*[/-]\s*(\d{1,2})\s*[/-]\s*(\d{4})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

// Slashes are inserted automatically as digits are typed (the "/" and "-"
// keys are blocked in the input itself, see `handleKeyDown`) — so typing
// "09272026" becomes "09/27/2026" live, with no separator keystrokes needed.
// Month/day each auto-detect 1 vs. 2 digits from content alone: a leading
// digit that can't start a valid two-digit segment (e.g. "9" — no month is
// 9X) locks in as a single digit immediately; "0"/"1" (month) or "0"-"3"
// (day) wait for a second digit to decide. Day's decision additionally
// checks how many digits are left overall — with only 5 left after the
// month (day + a 4-digit year), day is forced to 1 digit rather than
// greedily eating 2 and leaving the year short (confirmed against Figma's
// own example: "922026" → "9/2/2026", not "9/22/026").
function formatTypedDigits(digits: string): string {
  const segments: string[] = [];
  let i = 0;

  if (digits.length > i) {
    const d1 = digits[i];
    let monthLen = 1;
    if (d1 === "0") {
      monthLen = 2;
    } else if (d1 === "1") {
      const d2 = digits[i + 1];
      monthLen = d2 !== undefined && d2 <= "2" ? 2 : 1;
    }
    monthLen = Math.min(monthLen, digits.length - i);
    segments.push(digits.slice(i, i + monthLen));
    i += monthLen;
  }

  if (digits.length > i) {
    const remaining = digits.length - i;
    const e1 = digits[i];
    let dayLen = 1;
    if (remaining > 5) {
      if (e1 === "0" || e1 === "1" || e1 === "2") {
        dayLen = 2;
      } else if (e1 === "3") {
        const e2 = digits[i + 1];
        dayLen = e2 !== undefined && e2 <= "1" ? 2 : 1;
      }
    }
    dayLen = Math.min(dayLen, remaining);
    segments.push(digits.slice(i, i + dayLen));
    i += dayLen;
  }

  if (digits.length > i) {
    segments.push(digits.slice(i, i + 4));
  }

  return segments.join("/");
}

// Finds the character index in `formatted` (which includes the "/"
// separators) right after its `digitCount`-th digit — used to re-place the
// caret after reformatting so it lands after the same digit it followed
// before, instead of jumping to the end the way a naive controlled-input
// re-render otherwise would.
function positionAfterDigit(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let idx = 0; idx < formatted.length; idx++) {
    if (/\d/.test(formatted.charAt(idx))) {
      seen++;
      if (seen === digitCount) return idx + 1;
    }
  }
  return formatted.length;
}

export interface DateInputProps {
  /** Field label, rendered above the field. */
  label?: ReactNode;
  /** Helper or validation text, rendered below the field. */
  helpText?: ReactNode;
  /** Validation state. Error/success also style the help text and its icon. */
  status?: DateInputStatus;
  size?: DateInputSize;
  /** Defaults to `"MM / DD / YYYY"`, matching the reference design. */
  placeholder?: string;
  /** Controlled selected date. Omit to let the field manage its own state. */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Forwarded to the embedded `<DatePicker>` — see its own docs. */
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: 0 | 1;
  disabled?: boolean;
  /** Renders a hidden native input (ISO `yyyy-mm-dd`) so the value participates in a real <form> submission. */
  name?: string;
  id?: string;
  className?: string;
}

/**
 * A date field built on `<DatePicker>` — matches the reference design's own
 * Input/Date exactly: the same Field padding/radius/type tokens as
 * `<TextInput>` at every size, with a fixed leading Calendar icon (not
 * optional/customizable the way `<TextInput leadingIcon>` is — a date
 * field's own icon is always this one). The field is a real, typeable
 * `<input>` — type a date by hand ("01/11/2026") *or* click it to open the
 * calendar in a `<DropdownMenuPanel>` and pick a day, whichever's faster.
 * The panel's own padding *and* radius are scaled to this field's own size
 * instead of `<DropdownMenuPanel>`'s usual tiers (confirmed from Figma's own
 * "Dropdown" wrapper at all three sizes — background/border/shadow match
 * that component 1:1, only those two properties step differently).
 *
 * Single-value only, matching Figma's own spec (one field, one date) — a
 * range field would be a separate component built the same way, not a mode
 * bolted onto this one.
 */
export function DateInput({
  label,
  helpText,
  status = "default",
  size = "lg",
  placeholder = "MM / DD / YYYY",
  value: controlledValue,
  defaultValue = null,
  onChange,
  isDateDisabled,
  weekStartsOn,
  disabled = false,
  name,
  id,
  className,
}: DateInputProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  // The text actually shown in the field — kept separate from `value` so a
  // partial, not-yet-parseable keystroke ("01/1") isn't clobbered by
  // reformatting `value` on every render. Resynced from `value` below
  // whenever it changes for a reason other than typing itself finishing a
  // valid date (picking a day, a controlled `value` changing upstream).
  const [text, setText] = useState(() => (value ? formatDate(value) : ""));
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  // The DOM node, captured off the change event itself (not a JSX `ref`
  // prop) — `<DropdownMenuTrigger>` already claims that slot via
  // `cloneElement` (it *overwrites* rather than merges a second ref), so
  // this is the only way to also get a handle on the same input for
  // restoring the caret below.
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);

  useEffect(() => {
    setText(value ? formatDate(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.getTime()]);

  // Runs after the reformatted `text` actually lands in the DOM — setting
  // selection any earlier (e.g. synchronously inside the change handler)
  // gets clobbered when React syncs the input's value on this same render.
  useLayoutEffect(() => {
    if (pendingCaretRef.current !== null) {
      inputElRef.current?.setSelectionRange(pendingCaretRef.current, pendingCaretRef.current);
      pendingCaretRef.current = null;
    }
  }, [text]);

  function commit(date: Date) {
    setUncontrolledValue(date);
    onChange?.(date);
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    inputElRef.current = input;

    const digitsBeforeCaret = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
    const digits = input.value.replace(/\D/g, "").slice(0, 8);
    const formatted = formatTypedDigits(digits);

    setText(formatted);
    pendingCaretRef.current = positionAfterDigit(formatted, digitsBeforeCaret);

    const parsed = parseTypedDate(formatted);
    if (parsed && !isDateDisabled?.(parsed)) commit(parsed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Slashes (and dashes) are inserted automatically — see
    // `formatTypedDigits` — so a manually-typed one would just be stripped
    // right back out; blocking the keystroke avoids that flash-then-vanish.
    if (event.key === "/" || event.key === "-") {
      event.preventDefault();
    }
  }

  function handleBlur() {
    // Snap back to whatever's actually committed — an incomplete or
    // rejected (e.g. isDateDisabled) string shouldn't linger looking accepted.
    setText(value ? formatDate(value) : "");
  }

  function handlePick(date: Date) {
    commit(date);
    setText(formatDate(date));
    setOpen(false);
  }

  return (
    <div className={clsx("ds-date-input", `ds-date-input--${size}`, className)}>
      {label ? (
        <FieldLabel size={size} htmlFor={fieldId} className="ds-date-input__label">
          {label}
        </FieldLabel>
      ) : null}

      <DropdownMenu open={open} onOpenChange={setOpen} size={size}>
        <div className={clsx("ds-date-input__field", `ds-date-input__field--${status}`, disabled && "ds-date-input__field--disabled")}>
          <button
            type="button"
            className="ds-date-input__icon"
            aria-label="Open calendar"
            disabled={disabled}
            onClick={() => setOpen(!open)}
          >
            <Calendar />
          </button>
          <DropdownMenuTrigger>
            <input
              type="text"
              id={fieldId}
              className="ds-date-input__control"
              value={text}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={status === "error" || undefined}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoComplete="off"
            />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuPanel matchTriggerWidth={false} className="ds-date-input__panel" style={PANEL_STYLE[size]}>
          <DatePicker value={value} defaultMonth={value ?? undefined} onChange={handlePick} isDateDisabled={isDateDisabled} weekStartsOn={weekStartsOn} />
        </DropdownMenuPanel>
      </DropdownMenu>

      {helpText ? (
        <div className={clsx("ds-date-input__help", `ds-date-input__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}

      {name ? <input type="hidden" name={name} value={value ? toISODate(value) : ""} readOnly /> : null}
    </div>
  );
}
