import { useState } from "react";
import { Calendar, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { clsx } from "clsx";
import { IconButton } from "../IconButton";
import { Label } from "../Label";
import { Select } from "../Select";
import type { SelectOption } from "../Select";
import { TextInput } from "../TextInput";
import "./JournalEntry.css";

export interface JournalEntryLine {
  id: string;
  account?: string;
  department?: string;
  location?: string;
  memo?: string;
  /** At most one of these should be set per line — the UI disables (and clears) whichever field isn't in use once the other has a value. */
  debit?: number;
  credit?: number;
}

export interface JournalEntryValue {
  /** ISO "yyyy-mm-dd", matching `<input type="date">`'s own native value format. */
  date: string;
  reference?: string;
  lines: JournalEntryLine[];
}

export interface JournalEntryProps {
  value: JournalEntryValue;
  /** Called once, with the fully edited draft, when Save is confirmed. */
  onSave: (value: JournalEntryValue) => void;
  onCancel?: () => void;
  /** Reuses `Select`'s own option type — same shape, no need for a duplicate. */
  accountOptions: SelectOption[];
  departmentOptions: SelectOption[];
  locationOptions: SelectOption[];
  /** Controlled edit mode. Omit to let JournalEntry manage its own. */
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** Defaults to USD, 2-decimal. Applied to read-mode amounts and totals — edit-mode amount fields are plain numeric inputs. */
  formatAmount?: (amount: number) => string;
  "aria-label"?: string;
  className?: string;
}

const defaultFormatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

function cloneValue(value: JournalEntryValue): JournalEntryValue {
  return { ...value, lines: value.lines.map((line) => ({ ...line })) };
}

function sumAmount(lines: JournalEntryLine[], key: "debit" | "credit") {
  const cents = lines.reduce((total, line) => total + Math.round((line[key] ?? 0) * 100), 0);
  return cents / 100;
}

function formatShortDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function optionLabel(options: SelectOption[], value: string | undefined) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function parseAmount(raw: string): number | undefined {
  if (raw === "") return undefined;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * A double-entry journal entry: metadata (date, reference), a list of
 * debit/credit line items, and a total row that validates debits equal
 * credits. Data-driven — `lines` is an array on one `value` prop (closer
 * to `<DragList>`'s `items`+callbacks model than `<SettingsCard>`'s
 * children-based one), so there's no separate line-item sub-component to
 * import or render yourself.
 *
 * While editing, the whole entry is real nested `<fieldset>`s — one for
 * the date/reference metadata, one per line — rather than a flat grid of
 * divs. That's not just semantics: it's what makes adding/removing a line
 * a well-defined, announced unit for assistive tech, and it's what lets
 * each line's fields reflow into a stacked mobile layout on their own
 * instead of every field in the entry fighting one shared row for space.
 * Neither fieldset has a *visible* legend — the metadata fieldset and each
 * line both keep `aria-label` instead ("Entry details", "Line N"), so
 * they're still announced as distinct groups without a redundant on-screen
 * caption. Read mode has no form controls to group, so it stays a plain
 * `role="group"` — a `<fieldset>` around static text isn't meaningful.
 *
 * Every field is labelless-by-display, matching `<Fieldset>`'s own
 * placeholder-only convention. Each line is two `__line-col`s, not a flat
 * list of fields: left (Account, then Department+Location, then the
 * memo — three fixed, always-sequential rows, not fields that wrap
 * relative to each other) and right (Debit/Credit/delete) — the same
 * two-part shape read mode's own row already has (`__row-main`/
 * `__row-amounts`). Both columns carry a real `min-width` and neither
 * uses an `auto` flex-basis (each field's own `width: 100%` would
 * hijack that as its starting size, forcing an immediate wrap — hit and
 * fixed once already for the header's date/reference fields, then again
 * here for the left/right column split, so `flex-basis: 0` throughout
 * is deliberate, not a stray omission). That's what lets the whole right
 * column wrap below the left one as a unit once they no longer fit side
 * by side — pure flex-wrap driven by each column's own floor, no
 * container query needed. No card border/padding of its own either
 * (each line is set off from its neighbors by its own border-bottom
 * while editing — see `JournalEntry.css`). `TextInput`'s `placeholder`
 * still needs a real `aria-label` alongside it (a placeholder alone
 * isn't a reliable accessible name); `Select`'s doesn't, since its
 * placeholder is real visible button text, not a vanishing attribute.
 *
 * Debit/Credit each carry their own "DR"/"CR" tag as a `leadingIcon` —
 * neutral-colored (not read mode's red/green, which signals a *settled*
 * figure's sign, not an in-progress field's label), and dimmed to
 * `--content-placeholder` on whichever side has no value yet, matching
 * its own placeholder text. Whichever side is unused once the other has
 * a value is `disabled` and drops its tag entirely — just a plain "—",
 * relying on `TextInput`'s own `:has(:disabled)` background for the
 * "blends into the row" look, not a bespoke rule here.
 *
 * Debit always precedes Credit, and Account/Department/Location always
 * stay in that order (matching read mode, and Figma) — accounting
 * convention reads debits on the left, credits on the right, so this
 * isn't just a field order, it's part of what makes the aligned columns
 * (see Responsive layout) legible at a glance.
 *
 * Edits are draft-and-commit, adapted from `<SettingsCard>`'s own
 * uncontrolled-fields-plus-unmount cancel mechanism: that approach doesn't
 * fit a dynamic array of structured rows well, so instead entering edit
 * mode seeds an internal `draft` from `value`. Every field mutates only
 * `draft` until Save calls `onSave(draft)` or Cancel discards it.
 */
export function JournalEntry({
  value,
  onSave,
  onCancel,
  accountOptions,
  departmentOptions,
  locationOptions,
  editing: controlledEditing,
  defaultEditing = false,
  onEditingChange,
  formatAmount = defaultFormatAmount,
  "aria-label": ariaLabel,
  className,
}: JournalEntryProps) {
  const [uncontrolledEditing, setUncontrolledEditing] = useState(defaultEditing);
  const editing = controlledEditing ?? uncontrolledEditing;
  const [draft, setDraft] = useState<JournalEntryValue | null>(null);

  function setEditing(next: boolean) {
    setUncontrolledEditing(next);
    onEditingChange?.(next);
  }

  function updateDraft(updater: (current: JournalEntryValue) => JournalEntryValue) {
    setDraft((current) => updater(current ?? cloneValue(value)));
  }

  function handleEdit() {
    setDraft(cloneValue(value));
    setEditing(true);
  }

  function handleSave() {
    onSave(draft ?? value);
    setDraft(null);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(null);
    onCancel?.();
    setEditing(false);
  }

  /**
   * Return saves, Escape cancels — but only from a plain text/number/date
   * `<input>`, where Enter has no native meaning of its own to conflict
   * with. A `<button>` (a Select trigger, a dropdown menu item, even Save/
   * Cancel themselves) already activates on Enter via the browser's own
   * behavior, so handling Enter here too would double-fire — e.g. picking
   * an option from an open Select with Enter would also save and exit
   * edit mode.
   *
   * Escape only cancels when no `Select` dropdown is open anywhere in the
   * document. The naive fix — checking whether the key's own target is
   * inside `[role="menu"]` — doesn't hold: opening a `Select` via a click
   * doesn't actually move focus into its (portaled) menu, so Escape's
   * target is still the trigger button, outside the menu, even while it's
   * visibly open. Checking for *any* open menu, not just one containing
   * the event's target, is what actually prevents Escape from closing a
   * dropdown and cancelling the whole entry in the same keystroke.
   *
   * Escape also stops propagating once it cancels editing — `JournalEntry`
   * is a plausible thing to embed inside a `<Modal>` (e.g. an object
   * detail drawer), and `Modal` itself closes on Escape via the same
   * bubbling `onKeyDown` mechanism. Without this, cancelling an in-progress
   * edit here would also close the whole modal around it in the same
   * keystroke.
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLFieldSetElement>) {
    const target = event.target as HTMLElement;
    if (event.key === "Enter" && target instanceof HTMLInputElement) {
      event.preventDefault();
      handleSave();
    } else if (event.key === "Escape" && !document.querySelector('[role="menu"]')) {
      event.stopPropagation();
      handleCancel();
    }
  }

  function updateLine(id: string, patch: Partial<JournalEntryLine>) {
    updateDraft((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    }));
  }

  /**
   * A new line starts pre-filled to close the entry's current gap, if any
   * — a plain blank line only when it's already balanced (nothing to
   * close) or empty. This is the common case a "+" click is actually
   * for: the entry is off by some amount and the next line is going to
   * be the one that fixes it, so it starts already holding that amount
   * on whichever side is short, ready to just pick an account for.
   */
  function handleAddLine() {
    updateDraft((current) => {
      const gap = Math.round((sumAmount(current.lines, "debit") - sumAmount(current.lines, "credit")) * 100) / 100;
      const newLine: JournalEntryLine =
        gap > 0 ? { id: crypto.randomUUID(), credit: gap } : gap < 0 ? { id: crypto.randomUUID(), debit: -gap } : { id: crypto.randomUUID() };
      return { ...current, lines: [...current.lines, newLine] };
    });
  }

  function handleRemoveLine(id: string) {
    updateDraft((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== id) }));
  }

  const displayed = editing ? (draft ?? value) : value;
  const totalDebit = sumAmount(displayed.lines, "debit");
  const totalCredit = sumAmount(displayed.lines, "credit");
  const balanced = Math.round(totalDebit * 100) === Math.round(totalCredit * 100);
  /** Nothing to validate yet (no lines, or lines with no amounts entered) — showing "Balanced" for 0 = 0 isn't meaningful, matching Figma's own empty-state frame, which hides the pill entirely rather than showing it trivially true. */
  const isEmpty = totalDebit === 0 && totalCredit === 0;

  const content = (
    <>
      <div className="ds-journal-entry__header">
        {editing ? (
          <fieldset aria-label="Entry details" className="ds-journal-entry__meta">
            <div className="ds-journal-entry__meta-grid">
              <TextInput
                type="date"
                size="sm"
                aria-label="Date"
                leadingIcon={<Calendar size={16} />}
                value={displayed.date}
                onChange={(event) => updateDraft((current) => ({ ...current, date: event.target.value }))}
              />
              <TextInput
                type="text"
                size="sm"
                placeholder="#ID"
                aria-label="Reference number"
                value={displayed.reference ?? ""}
                onChange={(event) => updateDraft((current) => ({ ...current, reference: event.target.value }))}
              />
            </div>
          </fieldset>
        ) : (
          <span className="ds-journal-entry__header-date">
            {formatShortDate(value.date)}
            {value.reference ? (
              <>
                {" • "}
                <span className="ds-journal-entry__header-reference">#{value.reference}</span>
              </>
            ) : null}
          </span>
        )}

        <div className="ds-journal-entry__header-spacer" />

        {editing ? (
          <div className="ds-journal-entry__header-actions">
            <IconButton icon={<Check size={16} />} aria-label="Save" variant="ghost" size="sm" onClick={handleSave} />
            <IconButton icon={<X size={16} />} aria-label="Cancel editing" variant="ghost" size="sm" onClick={handleCancel} />
          </div>
        ) : (
          <IconButton icon={<Pencil size={16} />} aria-label="Edit" variant="ghost" size="sm" onClick={handleEdit} />
        )}
      </div>

      <div className="ds-journal-entry__lines">
        {displayed.lines.map((line, index) =>
          editing ? (
            <fieldset key={line.id} aria-label={`Line ${index + 1}`} className="ds-journal-entry__line">
              <div className="ds-journal-entry__line-col">
                <Select
                  size="sm"
                  options={accountOptions}
                  value={line.account}
                  placeholder="Account"
                  onChange={(next) => updateLine(line.id, { account: next })}
                />

                <div className="ds-journal-entry__line-dept-location">
                  <Select
                    size="sm"
                    options={departmentOptions}
                    value={line.department}
                    placeholder="Department"
                    onChange={(next) => updateLine(line.id, { department: next })}
                  />
                  <Select
                    size="sm"
                    options={locationOptions}
                    value={line.location}
                    placeholder="Location"
                    onChange={(next) => updateLine(line.id, { location: next })}
                  />
                </div>

                <TextInput
                  type="text"
                  size="sm"
                  placeholder="Description/Memo"
                  aria-label="Description"
                  value={line.memo ?? ""}
                  onChange={(event) => updateLine(line.id, { memo: event.target.value })}
                  className="ds-journal-entry__line-description"
                />
              </div>

              <div className="ds-journal-entry__line-col">
                <div className="ds-journal-entry__line-amounts">
                  <TextInput
                    type="number"
                    step="0.01"
                    size="sm"
                    placeholder={line.credit != null ? "—" : "0.00"}
                    aria-label="Debit"
                    disabled={line.credit != null}
                    leadingIcon={
                      line.credit == null ? (
                        <span
                          className={clsx(
                            "ds-journal-entry__amount-tag",
                            line.debit == null && "ds-journal-entry__amount-tag--empty",
                          )}
                        >
                          DR
                        </span>
                      ) : undefined
                    }
                    value={line.debit ?? ""}
                    onChange={(event) => {
                      const debit = parseAmount(event.target.value);
                      updateLine(line.id, { debit, credit: debit != null ? undefined : line.credit });
                    }}
                    className="ds-journal-entry__amount-input"
                  />
                  <TextInput
                    type="number"
                    step="0.01"
                    size="sm"
                    placeholder={line.debit != null ? "—" : "0.00"}
                    aria-label="Credit"
                    disabled={line.debit != null}
                    leadingIcon={
                      line.debit == null ? (
                        <span
                          className={clsx(
                            "ds-journal-entry__amount-tag",
                            line.credit == null && "ds-journal-entry__amount-tag--empty",
                          )}
                        >
                          CR
                        </span>
                      ) : undefined
                    }
                    value={line.credit ?? ""}
                    onChange={(event) => {
                      const credit = parseAmount(event.target.value);
                      updateLine(line.id, { credit, debit: credit != null ? undefined : line.debit });
                    }}
                    className="ds-journal-entry__amount-input"
                  />
                  <IconButton
                    icon={<Trash2 size={16} />}
                    aria-label={`Remove line ${index + 1}`}
                    variant="ghost"
                    size="sm"
                    className="ds-journal-entry__line-delete"
                    onClick={() => handleRemoveLine(line.id)}
                  />
                </div>
              </div>
            </fieldset>
          ) : (
            <div key={line.id} className="ds-journal-entry__row">
              <div className="ds-journal-entry__row-main">
                <div className="ds-journal-entry__row-summary">
                  <span className="ds-journal-entry__account">{optionLabel(accountOptions, line.account)}</span>
                  {line.department ? (
                    <span className="ds-journal-entry__subtle"> • {optionLabel(departmentOptions, line.department)}</span>
                  ) : null}
                  {line.location ? (
                    <span className="ds-journal-entry__subtle"> • {optionLabel(locationOptions, line.location)}</span>
                  ) : null}
                </div>
                {line.memo ? <div className="ds-journal-entry__memo-text">{line.memo}</div> : null}
              </div>

              <div className="ds-journal-entry__row-amounts">
                <span className="ds-journal-entry__amount">
                  <span className="ds-journal-entry__amount-tag ds-journal-entry__amount-tag--debit">DR</span>
                  <span className={line.debit == null ? "ds-journal-entry__amount-blank" : undefined}>
                    {line.debit != null ? formatAmount(line.debit) : "—"}
                  </span>
                </span>
                <span className="ds-journal-entry__amount">
                  <span className="ds-journal-entry__amount-tag ds-journal-entry__amount-tag--credit">CR</span>
                  <span className={line.credit == null ? "ds-journal-entry__amount-blank" : undefined}>
                    {line.credit != null ? formatAmount(line.credit) : "—"}
                  </span>
                </span>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="ds-journal-entry__total">
        {editing ? (
          <IconButton icon={<Plus size={16} />} aria-label="Add line" variant="ghost" size="sm" onClick={handleAddLine} />
        ) : null}

        <span className="ds-journal-entry__total-label">Total</span>

        {isEmpty ? null : (
          <Label status={balanced ? "positive" : "negative"} leadingIcon={balanced ? <Check size={16} /> : undefined}>
            {balanced ? "Balanced" : `Off by ${formatAmount(Math.abs(totalDebit - totalCredit))}`}
          </Label>
        )}

        <div className="ds-journal-entry__header-spacer" />

        <div className="ds-journal-entry__row-amounts">
          <span className="ds-journal-entry__amount">
            <span className="ds-journal-entry__amount-tag ds-journal-entry__amount-tag--debit">DR</span>
            <span className={totalDebit === 0 ? "ds-journal-entry__amount-blank" : undefined}>
              {totalDebit > 0 ? formatAmount(totalDebit) : "—"}
            </span>
          </span>
          <span className="ds-journal-entry__amount">
            <span className="ds-journal-entry__amount-tag ds-journal-entry__amount-tag--credit">CR</span>
            <span className={totalCredit === 0 ? "ds-journal-entry__amount-blank" : undefined}>
              {totalCredit > 0 ? formatAmount(totalCredit) : "—"}
            </span>
          </span>
        </div>

        {/* Matches the delete button's own footprint (width + gap) in each
            line above, so the DR/CR amounts here land in the same column
            as the DR/CR fields there, instead of running flush to the
            true right edge. */}
        {editing ? <span className="ds-journal-entry__total-gutter" aria-hidden /> : null}
      </div>
    </>
  );

  const rootClassName = clsx("ds-journal-entry", editing ? "ds-journal-entry--editing" : "ds-journal-entry--read", className);

  return editing ? (
    <fieldset aria-label={ariaLabel} className={rootClassName} onKeyDown={handleKeyDown}>
      {content}
    </fieldset>
  ) : (
    <div role="group" aria-label={ariaLabel} className={rootClassName}>
      {content}
    </div>
  );
}
