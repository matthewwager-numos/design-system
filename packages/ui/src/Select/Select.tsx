import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Check, ChevronDown, TriangleAlert } from "lucide-react";
import { clsx } from "clsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../DropdownMenu";
import { FieldLabel } from "../FieldLabel";
import "./Select.css";

export type SelectSize = "sm" | "md" | "lg";
export type SelectStatus = "default" | "error" | "success";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  leadingIcon?: ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  /** Controlled value. Omit to let the Select manage its own state. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: ReactNode;
  label?: ReactNode;
  helpText?: ReactNode;
  status?: SelectStatus;
  size?: SelectSize;
  disabled?: boolean;
  /** Renders a hidden native input so the value participates in a real <form> submission. */
  name?: string;
  id?: string;
  className?: string;
}

/**
 * A single-choice field built on <DropdownMenu>. Sizes/states/tokens mirror
 * <TextInput> exactly, since Figma's Select trigger is the same field
 * anatomy — only the field content (a button showing the selected option
 * instead of an editable value) and the trailing chevron differ.
 */
export function Select({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Select an option",
  label,
  helpText,
  status = "default",
  size = "lg",
  disabled = false,
  name,
  id,
  className,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const selected = options.find((option) => option.value === value);
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const chevronSize = size === "lg" ? 24 : 16;

  function handleSelect(next: string) {
    setUncontrolledValue(next);
    onChange?.(next);
  }

  return (
    <div className={clsx("ds-select", `ds-select--${size}`, className)}>
      {label ? (
        <FieldLabel size={size} htmlFor={fieldId} className="ds-select__label">
          {label}
        </FieldLabel>
      ) : null}

      <DropdownMenu open={open} onOpenChange={setOpen} size={size}>
        <DropdownMenuTrigger>
          <button
            type="button"
            id={fieldId}
            disabled={disabled}
            aria-invalid={status === "error" || undefined}
            className={clsx("ds-select__field", `ds-select__field--${status}`)}
          >
            {selected?.leadingIcon ? <span className="ds-select__icon" aria-hidden>{selected.leadingIcon}</span> : null}
            <span className={clsx("ds-select__value", !selected && "ds-select__value--placeholder")}>
              {selected ? selected.label : placeholder}
            </span>
            <span className={clsx("ds-select__icon", "ds-select__chevron", open && "ds-select__chevron--open")} aria-hidden>
              <ChevronDown size={chevronSize} />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent matchTriggerWidth>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              leadingIcon={option.leadingIcon}
              active={option.value === value}
              disabled={option.disabled}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {helpText ? (
        <div className={clsx("ds-select__help", `ds-select__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}

      {name ? <input type="hidden" name={name} value={value ?? ""} readOnly /> : null}
    </div>
  );
}
