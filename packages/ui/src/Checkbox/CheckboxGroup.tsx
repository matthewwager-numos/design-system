import type { ReactNode } from "react";
import { clsx } from "clsx";
import { CheckboxGroupContext } from "./CheckboxGroupContext";
import { FieldLabel } from "../FieldLabel";
import "./CheckboxGroup.css";

export type CheckboxGroupSize = "md" | "lg";

export interface CheckboxGroupProps {
  /** Group legend, rendered above the options. */
  label?: ReactNode;
  /** Helper or validation text, rendered below the options. */
  helpText?: ReactNode;
  error?: boolean;
  /** Cascades to every child `<Checkbox>` that doesn't set its own `size` — same pattern as `<RadioGroup>`. Defaults to "md". */
  size?: CheckboxGroupSize;
  /** `<Checkbox>`s. */
  children: ReactNode;
  className?: string;
}

/**
 * A labeled, vertically-stacked set of `<Checkbox>`s — a real `<fieldset>`/
 * `<legend>`, so assistive tech announces the group's label once rather than
 * repeating it per checkbox. Confirmed via Figma: the group's own legend is
 * a real `<FieldLabel>` instance (unlike each individual `<Checkbox>`'s own
 * label, which is plain option/value text, not a field label).
 */
export function CheckboxGroup({ label, helpText, error = false, size = "md", children, className }: CheckboxGroupProps) {
  return (
    <CheckboxGroupContext.Provider value={{ size }}>
      <fieldset className={clsx("ds-checkbox-group", `ds-checkbox-group--${size}`, className)}>
        {label && (
          <FieldLabel as="legend" size={size} className="ds-checkbox-group__label">
            {label}
          </FieldLabel>
        )}
        <div className="ds-checkbox-group__options">{children}</div>
        {helpText && <span className={clsx("ds-checkbox-group__help", error && "ds-checkbox-group__help--error")}>{helpText}</span>}
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
}
