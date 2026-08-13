import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FocusEvent, InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { Check, Search, TriangleAlert, X } from "lucide-react";
import { clsx } from "clsx";
import "./SearchInput.css";

export type SearchInputSize = "sm" | "md" | "lg";
export type SearchInputStatus = "default" | "error" | "success";

export interface SearchInputOption {
  value: string;
  /** Plain string, not a ReactNode — it's what fills the field when this option is picked, and what typed text is matched against. */
  label: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
}

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange" | "onSelect"> {
  /** The full list of suggestions. Omit (or pass `[]`) for a plain search box with no dropdown at all. */
  options?: SearchInputOption[];
  /** Controlled text value. Omit to let SearchInput manage its own. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called when a suggestion is picked (`onChange` also fires, with that option's `label`). */
  onSelect?: (option: SearchInputOption) => void;
  /**
   * How `options` are narrowed by the typed text. Defaults to a
   * case-insensitive substring match on `label`. Pass `null` to turn off
   * this built-in filtering — e.g. for server-side/async search, where
   * `options` is already exactly what should show, filtered by the caller.
   */
  filter?: ((option: SearchInputOption, query: string) => boolean) | null;
  label?: ReactNode;
  helpText?: ReactNode;
  status?: SearchInputStatus;
  size?: SearchInputSize;
}

const defaultFilter = (option: SearchInputOption, query: string) => option.label.toLowerCase().includes(query.trim().toLowerCase());

function findEnabledIndex(options: SearchInputOption[], start: number, direction: 1 | -1): number {
  const count = options.length;
  if (count === 0) return -1;
  let index = start;
  for (let step = 0; step < count; step++) {
    index = (index + direction + count) % count;
    if (!options[index]!.disabled) return index;
  }
  return -1;
}

/**
 * A text field that filters a list of suggestions as you type — an ARIA
 * combobox: `role="combobox"` on a real `<input>` (so it behaves exactly
 * like `<TextInput>` — free typing, no forced commit to one of the listed
 * values) paired with a `role="listbox"` popup, matching Figma's Search
 * Input (the field) and Combobox (the filtered dropdown) together.
 *
 * Deliberately not built on `<DropdownMenu>` (which `<Select>` uses):
 * `<DropdownMenuContent>` moves real DOM focus onto menu items for
 * keyboard nav, which would steal focus away from the input mid-type. A
 * combobox instead tracks "which option is highlighted" as plain state and
 * exposes it via `aria-activedescendant`, so focus never leaves the input.
 *
 * Field states (hover/focus/error/success/disabled) are real CSS, same
 * philosophy as `<TextInput>` — confirmed size-for-size against Figma's own
 * Search Input to be the identical field anatomy, just with a permanent
 * leading search icon.
 */
export function SearchInput({
  options = [],
  value: controlledValue,
  defaultValue = "",
  onChange,
  onSelect,
  filter = defaultFilter,
  label,
  helpText,
  status = "default",
  size = "lg",
  disabled = false,
  id,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}: SearchInputProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!value || !filter) return options;
    return options.filter((option) => filter(option, value));
  }, [options, value, filter]);

  useEffect(() => {
    if (highlightedIndex >= filtered.length) setHighlightedIndex(0);
  }, [filtered.length, highlightedIndex]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function setValue(next: string) {
    setUncontrolledValue(next);
    onChange?.(next);
  }

  function selectOption(option: SearchInputOption) {
    if (option.disabled) return;
    setValue(option.label);
    onSelect?.(option);
    setOpen(false);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    onFocus?.(event);
    setFocused(true);
    if (options.length > 0) setOpen(true);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    onBlur?.(event);
    setFocused(false);
    setOpen(false);
  }

  function handleClear() {
    setValue("");
    setHighlightedIndex(0);
    inputRef.current?.focus();
    if (options.length > 0) setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((i) => findEnabledIndex(filtered, i, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((i) => findEnabledIndex(filtered, i, -1));
        break;
      case "Home":
        event.preventDefault();
        setHighlightedIndex(findEnabledIndex(filtered, -1, 1));
        break;
      case "End":
        event.preventDefault();
        setHighlightedIndex(findEnabledIndex(filtered, 0, -1));
        break;
      case "Enter": {
        const option = filtered[highlightedIndex];
        if (option) {
          event.preventDefault();
          selectOption(option);
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
    }
  }

  const showListbox = open && filtered.length > 0;
  const activeOptionId = showListbox && filtered[highlightedIndex] ? `${listboxId}-option-${highlightedIndex}` : undefined;
  const showClear = !disabled && (value.length > 0 || focused);

  return (
    <div className={clsx("ds-search-input", `ds-search-input--${size}`, className)} ref={rootRef}>
      {label ? (
        <label className="ds-search-input__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <div className="ds-search-input__anchor">
        <div className={clsx("ds-search-input__field", `ds-search-input__field--${status}`)}>
          <span className="ds-search-input__icon" aria-hidden>
            <Search />
          </span>
          <input
            ref={inputRef}
            id={inputId}
            role="combobox"
            aria-expanded={showListbox}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-invalid={status === "error" || undefined}
            disabled={disabled}
            className="ds-search-input__control"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setHighlightedIndex(0);
              if (options.length > 0) setOpen(true);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...rest}
          />
          {showClear ? (
            <button
              type="button"
              className="ds-search-input__clear"
              aria-label="Clear search"
              // Same fix as option clicks: prevent the default
              // focus-shifting behavior of mousedown on a click target so
              // the input never blurs (and the clear button never
              // vanishes) before its own click can fire.
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
            >
              <X />
            </button>
          ) : null}
        </div>

        {showListbox && (
          <ul id={listboxId} role="listbox" className="ds-search-input__listbox">
            {filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                aria-disabled={option.disabled || undefined}
                className={clsx(
                  "ds-search-input__option",
                  index === highlightedIndex && "ds-search-input__option--highlighted",
                  option.disabled && "ds-search-input__option--disabled",
                )}
                onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                // Clicking a non-focusable element still blurs the currently
                // focused one by default (focus falls back to <body>) —
                // without preventing that here, the input's onBlur would
                // close (and unmount) the listbox before this click ever
                // reaches onClick, so the selection would silently never
                // happen. Standard combobox fix: block mousedown's default
                // focus-shifting behavior so the input never blurs at all.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {option.leadingIcon ? (
                  <span className="ds-search-input__option-icon" aria-hidden>
                    {option.leadingIcon}
                  </span>
                ) : null}
                <span className="ds-search-input__option-label">{option.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {helpText ? (
        <div className={clsx("ds-search-input__help", `ds-search-input__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}
    </div>
  );
}
