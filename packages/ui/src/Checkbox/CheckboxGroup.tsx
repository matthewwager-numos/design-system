import type { ReactNode } from "react";
import { clsx } from "clsx";
import "./CheckboxGroup.css";

export interface CheckboxGroupProps {
  /** Group legend, rendered above the options. */
  label?: ReactNode;
  /** Helper or validation text, rendered below the options. */
  helpText?: ReactNode;
  error?: boolean;
  /** `<Checkbox>`s. */
  children: ReactNode;
  className?: string;
}

/**
 * A labeled, vertically-stacked set of `<Checkbox>`s — a real `<fieldset>`/
 * `<legend>`, so assistive tech announces the group's label once rather than
 * repeating it per checkbox. Figma's "Checkbox Group" is just a layout
 * symbol (a vertical stack with a gap) with no distinct visual spec of its
 * own beyond that, so this is a straightforward `<fieldset>` wrapper rather
 * than something pulled from detailed Figma states.
 */
export function CheckboxGroup({ label, helpText, error = false, children, className }: CheckboxGroupProps) {
  return (
    <fieldset className={clsx("ds-checkbox-group", className)}>
      {label && <legend className="ds-checkbox-group__label">{label}</legend>}
      <div className="ds-checkbox-group__options">{children}</div>
      {helpText && <span className={clsx("ds-checkbox-group__help", error && "ds-checkbox-group__help--error")}>{helpText}</span>}
    </fieldset>
  );
}
