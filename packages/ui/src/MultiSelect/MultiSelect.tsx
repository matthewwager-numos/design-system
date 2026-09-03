import { Fragment, useId, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Check, ChevronDown, TriangleAlert, X } from "lucide-react";
import { clsx } from "clsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../DropdownMenu";
import { FieldLabel } from "../FieldLabel";
import "./MultiSelect.css";

export type MultiSelectSize = "sm" | "md" | "lg";
export type MultiSelectStatus = "default" | "error" | "success";

export interface MultiSelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  /** Controlled selected values. Omit to let the MultiSelect manage its own state. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: ReactNode;
  label?: ReactNode;
  helpText?: ReactNode;
  status?: MultiSelectStatus;
  size?: MultiSelectSize;
  disabled?: boolean;
  /** Renders one hidden native input per selected value (same `name`), so the values participate in a real <form> submission via `FormData.getAll(name)`. */
  name?: string;
  id?: string;
  className?: string;
}

/**
 * A multi-choice field built on the same pieces as `<Select>` — `<DropdownMenu>`
 * for the panel, `<FieldLabel>` for the label, and `<Label>`'s own token classes
 * (`ds-label`/`ds-label--info`) for the removable chips — not the `<Label>`
 * component itself, since its `trailingIcon` slot is hardcoded `aria-hidden`
 * (correct for a decorative icon, wrong for a real "remove" button; reusing
 * its CSS classes directly keeps the exact same look without that conflict).
 *
 * Confirmed from Figma: the field shows two different things depending on
 * whether the panel is open — closed, a comma-joined text summary (like a
 * single `<Select>`'s own value); open, the full set of removable chips —
 * not chips all the time, which would make a long selection permanently
 * inflate the field's resting height.
 */
export function MultiSelect({
  options,
  value: controlledValue,
  defaultValue = [],
  onChange,
  placeholder = "Select options",
  label,
  helpText,
  status = "default",
  size = "lg",
  disabled = false,
  name,
  id,
  className,
}: MultiSelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const selected = options.filter((option) => value.includes(option.value));
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const iconSize = size === "lg" ? 24 : 16;
  const chipSize = size === "lg" ? "lg" : "md";

  function setValue(next: string[]) {
    setUncontrolledValue(next);
    onChange?.(next);
  }

  function toggleValue(optionValue: string) {
    setValue(value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]);
  }

  function removeValue(event: MouseEvent, optionValue: string) {
    // Stops here, not at the field — otherwise this bubbles up to the same
    // click DropdownMenuTrigger listens for and re-toggles the panel open.
    event.stopPropagation();
    setValue(value.filter((v) => v !== optionValue));
  }

  function clearAll(event: MouseEvent) {
    event.stopPropagation();
    setValue([]);
  }

  function handleFieldKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Ignore keydowns bubbling up from a chip's own remove button — only
    // react when the field itself (not a child) is the actual target.
    if (event.target !== event.currentTarget) return;
    if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    setOpen(!open);
  }

  return (
    <div className={clsx("ds-multi-select", `ds-multi-select--${size}`, className)}>
      {label ? (
        <FieldLabel size={size} htmlFor={fieldId} className="ds-multi-select__label">
          {label}
        </FieldLabel>
      ) : null}

      <DropdownMenu open={open} onOpenChange={setOpen} size={size}>
        <DropdownMenuTrigger>
          {/* A role="button" div, not a real <button> — same reasoning as
              <Card>: this needs to contain other real interactive controls
              (each chip's remove button), and a <button> can't legally
              contain another one. */}
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            id={fieldId}
            aria-disabled={disabled || undefined}
            aria-invalid={status === "error" || undefined}
            onKeyDown={handleFieldKeyDown}
            className={clsx(
              "ds-multi-select__field",
              `ds-multi-select__field--${status}`,
              disabled && "ds-multi-select__field--disabled",
            )}
          >
            {open && selected.length > 0 ? (
              <span className="ds-multi-select__chips">
                {selected.map((option) => (
                  <span key={option.value} className={clsx("ds-label", "ds-label--info", `ds-label--${chipSize}`, "ds-multi-select__chip")}>
                    <span className="ds-label__text">{option.label}</span>
                    <button
                      type="button"
                      className="ds-multi-select__chip-remove"
                      aria-label={`Remove ${typeof option.label === "string" ? option.label : "option"}`}
                      onClick={(event) => removeValue(event, option.value)}
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </span>
                ))}
              </span>
            ) : (
              <span className={clsx("ds-multi-select__value", selected.length === 0 && "ds-multi-select__value--placeholder")}>
                {selected.length > 0
                  ? selected.map((option, index) => (
                      <Fragment key={option.value}>
                        {index > 0 && ", "}
                        {option.label}
                      </Fragment>
                    ))
                  : placeholder}
              </span>
            )}

            {open && selected.length > 0 ? (
              <button type="button" className="ds-multi-select__icon ds-multi-select__clear" aria-label="Clear all" onClick={clearAll}>
                <X size={iconSize} />
              </button>
            ) : (
              <span className={clsx("ds-multi-select__icon", "ds-multi-select__chevron", open && "ds-multi-select__chevron--open")} aria-hidden>
                <ChevronDown size={iconSize} />
              </span>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent matchTriggerWidth>
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <DropdownMenuItem
                key={option.value}
                disabled={option.disabled}
                trailingIcon={isSelected ? <Check size={16} aria-hidden /> : undefined}
                closeOnSelect={false}
                onClick={() => toggleValue(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {helpText ? (
        <div className={clsx("ds-multi-select__help", `ds-multi-select__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}

      {name ? value.map((v) => <input key={v} type="hidden" name={name} value={v} readOnly />) : null}
    </div>
  );
}
