import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactNode } from "react";
import { Check, Filter, Search, TriangleAlert, X } from "lucide-react";
import { clsx } from "clsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuPanel } from "../DropdownMenu";
import { FieldLabel } from "../FieldLabel";
import "./SearchFilter.css";

export type SearchFilterSize = "sm" | "md" | "lg";
export type SearchFilterStatus = "default" | "error" | "success";

export interface SearchFilterPropertyValue {
  /** Inserted after the colon when picked, e.g. `"paid"` for `"status:paid"`. */
  value: string;
  /** Plain string, not a ReactNode — shown in the suggestions list and matched against whatever's typed after the colon. */
  label: string;
}

export interface SearchFilterProperty {
  /** The token prefix before the colon, e.g. `"status"` for `"status:paid"`. Matched case-insensitively against a typed `"key:"` prefix. */
  key: string;
  /** Plain string — shown as `"<label>:"` when suggesting this property, and matched against a bare (no colon yet) typed word. */
  label: string;
  /** This property's own suggested values, shown (and narrowed by whatever's typed after the colon) once `key:` is recognized in the current token. */
  values: SearchFilterPropertyValue[];
}

type Suggestion =
  | { kind: "property"; property: SearchFilterProperty }
  | { kind: "value"; property: SearchFilterProperty; value: SearchFilterPropertyValue };

// The "word" currently being typed — the last whitespace-delimited run of
// the full value. Suggestions are computed from (and a picked suggestion
// replaces) just this run, leaving any earlier, already-finished clauses
// (e.g. "status:paid " before it) untouched.
function currentToken(value: string): string {
  return value.match(/\S*$/)?.[0] ?? "";
}

function replaceCurrentToken(value: string, replacement: string): string {
  return value.slice(0, value.length - currentToken(value).length) + replacement;
}

// No colon yet in the current token → suggest matching properties. A colon
// present → look up that property by the part before it and suggest its
// values, narrowed by the part after it. An unrecognized property key
// suggests nothing, rather than falling back to every property's values.
function computeSuggestions(properties: SearchFilterProperty[], token: string): Suggestion[] {
  const colonIndex = token.indexOf(":");
  if (colonIndex === -1) {
    const query = token.toLowerCase();
    return properties
      .filter((property) => !query || property.key.toLowerCase().includes(query) || property.label.toLowerCase().includes(query))
      .map((property) => ({ kind: "property" as const, property }));
  }
  const key = token.slice(0, colonIndex).toLowerCase();
  const query = token.slice(colonIndex + 1).toLowerCase();
  const property = properties.find((candidate) => candidate.key.toLowerCase() === key);
  if (!property) return [];
  return property.values
    .filter((value) => !query || value.value.toLowerCase().includes(query) || value.label.toLowerCase().includes(query))
    .map((value) => ({ kind: "value" as const, property, value }));
}

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
  /**
   * Turns on the typing suggestions dropdown, and gives it something to
   * suggest: property names (rendered as `"key:"`) while the word being
   * typed has no colon yet, or that property's own values once it does.
   * Independent of `filters` — this is about narrowing what gets typed into
   * the field itself, not the separate filter-panel picker. Omit for a
   * plain field with no suggestions.
   */
  properties?: SearchFilterProperty[];
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
 * The typed field also gets its own, separate suggestions dropdown when
 * `properties` is given — an ARIA combobox modeled directly on
 * `<SearchInput>`'s own (see that component's doc comment for why it's
 * deliberately NOT built on `<DropdownMenu>` either: moving real focus onto
 * a menu item would steal it away from the input mid-type). The two popups
 * are mutually exclusive — opening one closes the other — since they'd
 * otherwise visually collide right under the same field.
 *
 * Modeled on Gmail's own search bar: building filters in the panel and
 * typing directly in the field are the same `value` — this component
 * doesn't parse or generate filter notation itself (it has no idea what
 * your fields mean beyond whatever `properties` you hand it for
 * suggestions), it just shows whatever text you give it. Wire your own
 * filter controls' `onChange` to compose that notation and call this
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
  properties,
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
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const suggestListId = `${inputId}-suggestions`;
  const iconSize = size === "lg" ? 24 : 16;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasProperties = Boolean(properties && properties.length > 0);

  const suggestions = useMemo(() => computeSuggestions(properties ?? [], currentToken(value)), [properties, value]);

  useEffect(() => {
    if (highlightedIndex >= suggestions.length) setHighlightedIndex(0);
  }, [suggestions.length, highlightedIndex]);

  useEffect(() => {
    if (!suggestOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setSuggestOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [suggestOpen]);

  // The single funnel for both open states, so opening either one always
  // closes the other — a controlled `filtersOpen` still only ever turns
  // the panel on, never suggestions, but toggling it via the filter button
  // itself goes through here.
  function setOpen(next: boolean) {
    setUncontrolledOpen(next);
    onFiltersOpenChange?.(next);
    if (next) setSuggestOpen(false);
  }

  function openSuggestions() {
    if (!hasProperties) return;
    setSuggestOpen(true);
    if (filters && open) setOpen(false);
  }

  function setValue(next: string) {
    setUncontrolledValue(next);
    onChange?.(next);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    setHighlightedIndex(0);
    openSuggestions();
  }

  function handleFocus(_event: FocusEvent<HTMLInputElement>) {
    openSuggestions();
  }

  function handleBlur(_event: FocusEvent<HTMLInputElement>) {
    setSuggestOpen(false);
  }

  function selectSuggestion(suggestion: Suggestion) {
    if (suggestion.kind === "property") {
      // No trailing space — leaves the token as "key:" so typing continues
      // straight into that property's own values.
      setValue(replaceCurrentToken(value, `${suggestion.property.key}:`));
      setHighlightedIndex(0);
      inputRef.current?.focus();
    } else {
      setValue(`${replaceCurrentToken(value, `${suggestion.property.key}:${suggestion.value.value}`)} `);
      setHighlightedIndex(0);
      setSuggestOpen(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((i) => (suggestions.length ? (i + 1) % suggestions.length : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((i) => (suggestions.length ? (i - 1 + suggestions.length) % suggestions.length : 0));
        break;
      case "Home":
        event.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setHighlightedIndex(suggestions.length - 1);
        break;
      case "Enter": {
        const suggestion = suggestions[highlightedIndex];
        if (suggestion) {
          event.preventDefault();
          selectSuggestion(suggestion);
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        setSuggestOpen(false);
        break;
    }
  }

  const showSuggestions = suggestOpen && suggestions.length > 0;
  const activeOptionId = showSuggestions ? `${suggestListId}-option-${highlightedIndex}` : undefined;

  return (
    <div className={clsx("ds-search-filter", `ds-search-filter--${size}`, className)} ref={rootRef}>
      {label ? (
        <FieldLabel size={size} htmlFor={inputId} className="ds-search-filter__label">
          {label}
        </FieldLabel>
      ) : null}

      <DropdownMenu open={filters ? open : false} onOpenChange={filters ? setOpen : undefined} size={size}>
        <div className="ds-search-filter__anchor">
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
              ref={inputRef}
              id={inputId}
              type="text"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls={suggestListId}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              aria-invalid={status === "error" || undefined}
              disabled={disabled}
              className="ds-search-filter__control"
              placeholder={typeof placeholder === "string" ? placeholder : undefined}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
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

          {showSuggestions && (
            <ul id={suggestListId} role="listbox" className="ds-search-filter__listbox">
              {suggestions.map((suggestion, index) => {
                const key = suggestion.kind === "property" ? `p:${suggestion.property.key}` : `v:${suggestion.property.key}:${suggestion.value.value}`;
                return (
                  <li
                    key={key}
                    id={`${suggestListId}-option-${index}`}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className={clsx("ds-search-filter__option", index === highlightedIndex && "ds-search-filter__option--highlighted")}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    // Same fix as <SearchInput>'s own options: prevent
                    // mousedown's default focus-shifting behavior so the
                    // input never blurs (and the listbox never unmounts)
                    // before this click can reach onClick.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion.kind === "property" ? (
                      <span className="ds-search-filter__option-label">{suggestion.property.label}:</span>
                    ) : (
                      <>
                        <span className="ds-search-filter__option-property" aria-hidden>
                          {suggestion.property.label}:
                        </span>
                        <span className="ds-search-filter__option-label">{suggestion.value.label}</span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
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
