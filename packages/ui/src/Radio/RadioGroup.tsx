import { useId, useState } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { RadioGroupContext } from "./RadioGroupContext";
import { FieldLabel } from "../FieldLabel";
import "./RadioGroup.css";

export type RadioGroupOrientation = "vertical" | "horizontal";
export type RadioGroupSize = "md" | "lg";

export interface RadioGroupProps {
  /** Shared `name` for the native `<input type="radio">`s inside. Auto-generated if omitted. */
  name?: string;
  label?: ReactNode;
  helpText?: ReactNode;
  error?: boolean;
  /** Stacked (default) or side-by-side — side-by-side is the right call for a short, binary choice (True/False, Yes/No), where a full vertical list wastes space and reads as more of a decision than it is. */
  orientation?: RadioGroupOrientation;
  /** Cascades to every child `<Radio>` — a bare `<Radio>` isn't a supported standalone pattern (see `<Radio>`'s own docs), so this is the only place size is normally set. Defaults to "md". */
  size?: RadioGroupSize;
  /** Controlled selected value — matches a child `<Radio>`'s `value`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** `<Radio>`s. */
  children: ReactNode;
  className?: string;
}

/**
 * A labeled set of `<Radio>`s that drives selection for you — a real
 * `<fieldset>`/`<legend>` (assistive tech announces the label once, not per
 * radio) wrapping native `<input type="radio">`s grouped by a shared
 * `name`, which is what actually gives them radio-button (only one
 * selected) behavior. A bare, ungrouped `<Radio>` is a UX anti-pattern — a
 * single radio button by itself communicates nothing a `<Checkbox>` or
 * `<Toggle>` doesn't already say more clearly — so this is the only
 * supported way to use `<Radio>` in this library; see `orientation` for the
 * common two-option (True/False, Yes/No) case. Confirmed via Figma: the
 * group's own legend is a real `<FieldLabel>` instance (unlike each
 * individual `<Radio>`'s own label, which is plain option/value text).
 */
export function RadioGroup({ name, label, helpText, error = false, orientation = "vertical", size = "md", value: controlledValue, defaultValue, onValueChange, children, className }: RadioGroupProps) {
  const generatedName = useId();
  const resolvedName = name ?? generatedName;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;

  function handleChange(next: string) {
    setUncontrolledValue(next);
    onValueChange?.(next);
  }

  return (
    <RadioGroupContext.Provider value={{ name: resolvedName, value, onChange: handleChange, size }}>
      <fieldset className={clsx("ds-radio-group", `ds-radio-group--${size}`, className)}>
        {label && (
          <FieldLabel as="legend" size={size} className="ds-radio-group__label">
            {label}
          </FieldLabel>
        )}
        <div className={clsx("ds-radio-group__options", `ds-radio-group__options--${orientation}`)}>{children}</div>
        {helpText && <span className={clsx("ds-radio-group__help", error && "ds-radio-group__help--error")}>{helpText}</span>}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}
