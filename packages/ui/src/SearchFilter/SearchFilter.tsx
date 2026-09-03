import { useId, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { Check, Filter, Search, TriangleAlert, X } from "lucide-react";
import { clsx } from "clsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuPanel } from "../DropdownMenu";
import { FieldLabel } from "../FieldLabel";
import "./SearchFilter.css";

export type SearchFilterSize = "sm" | "md" | "lg";
export type SearchFilterStatus = "default" | "error" | "success";

export interface SearchFilterProps {
  /** The query text — free-typed, or standard filter notation (e.g. `"type:invoice status:paid"`) built from whatever's inside `filters`. SearchFilter treats it as plain text either way; building that notation from your own filter state is on you, the same way `filters`' own content is. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** The filter panel's own content — any input components (`<Checkbox>`, `<Slider>`, a date field, `<Setting>`, ...), rendered as-is. Omit to hide the filter button entirely (a plain search field). */
  filters?: ReactNode;
  /** Controlled filter panel open state. Omit to let SearchFilter manage its own — useful if something inside `filters` (e.g. an "Apply" button) should also close the panel. */
  filtersOpen?: boolean;
  defaultFiltersOpen?: boolean;
  onFiltersOpenChange?: (open: boolean) => void;
  placeholder?: ReactNode;
  label?: ReactNode;
  helpText?: ReactNode;
  status?: SearchFilterStatus;
  size?: SearchFilterSize;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * A search field with a filter button that opens a panel of arbitrary
 * fields — matches Figma's Search/Filter input exactly. Composes
 * `<DropdownMenu>` (open state, positioning, outside-click, Escape) with
 * `<DropdownMenuPanel>` (the "any input components" variant of its content,
 * not `<DropdownMenuContent>`'s `role="menu"` list — see that component's
 * own doc comment for why a menu's Arrow-key navigation would be wrong
 * here) rather than reimplementing either.
 *
 * Modeled on Gmail's own search bar: building filters in the panel and
 * typing directly in the field are the same `value` — this component
 * doesn't parse or generate filter notation itself (it has no idea what
 * your fields mean), it just shows whatever text you give it. Wire your
 * own filter controls' `onChange` to compose that notation and call this
 * component's `onChange` with it — see the docs for a worked example.
 */
export function SearchFilter({
  value: controlledValue,
  defaultValue = "",
  onChange,
  filters,
  filtersOpen: controlledFiltersOpen,
  defaultFiltersOpen = false,
  onFiltersOpenChange,
  placeholder = "Search or filter",
  label,
  helpText,
  status = "default",
  size = "lg",
  disabled = false,
  id,
  className,
}: SearchFilterProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultFiltersOpen);
  const open = controlledFiltersOpen ?? uncontrolledOpen;

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const iconSize = size === "lg" ? 24 : 16;

  function setOpen(next: boolean) {
    setUncontrolledOpen(next);
    onFiltersOpenChange?.(next);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setUncontrolledValue(event.target.value);
    onChange?.(event.target.value);
  }

  return (
    <div className={clsx("ds-search-filter", `ds-search-filter--${size}`, className)}>
      {label ? (
        <FieldLabel size={size} htmlFor={inputId} className="ds-search-filter__label">
          {label}
        </FieldLabel>
      ) : null}

      <DropdownMenu open={filters ? open : false} onOpenChange={filters ? setOpen : undefined} size={size}>
        <div
          className={clsx(
            "ds-search-filter__field",
            `ds-search-filter__field--${status}`,
            disabled && "ds-search-filter__field--disabled",
          )}
        >
          <span className="ds-search-filter__icon" aria-hidden>
            <Search />
          </span>
          <input
            id={inputId}
            type="text"
            aria-invalid={status === "error" || undefined}
            disabled={disabled}
            className="ds-search-filter__control"
            placeholder={typeof placeholder === "string" ? placeholder : undefined}
            value={value}
            onChange={handleChange}
          />
          {filters ? (
            <DropdownMenuTrigger>
              {/* <DropdownMenuTrigger> always sets aria-haspopup="menu" —
                  written for <DropdownMenuContent>'s own role="menu" case.
                  This panel is really a role-less "dialog" of arbitrary
                  fields, not a menu; fixing the mismatch means changing
                  what every other DropdownMenuTrigger consumer gets too, so
                  it's left as a known, minor ARIA inaccuracy rather than
                  taken on here. */}
              <button
                type="button"
                className="ds-search-filter__filter-button"
                disabled={disabled}
                aria-label={open ? "Close filters" : "Open filters"}
              >
                {open ? <X size={iconSize} /> : <Filter size={iconSize} />}
              </button>
            </DropdownMenuTrigger>
          ) : null}
        </div>

        {filters ? <DropdownMenuPanel className="ds-search-filter__panel">{filters}</DropdownMenuPanel> : null}
      </DropdownMenu>

      {helpText ? (
        <div className={clsx("ds-search-filter__help", `ds-search-filter__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}
    </div>
  );
}
