import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { FieldLabel } from "../FieldLabel";
import "./Toggle.css";

export type ToggleSize = "sm" | "md" | "lg";
export type ToggleLabelPlacement = "right" | "left" | "above";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Label, rendered next to (or above) the switch. */
  label?: ReactNode;
  size?: ToggleSize;
  /** Where `label` sits relative to the switch. Defaults to "right" (Figma's own layout). */
  labelPlacement?: ToggleLabelPlacement;
}

/**
 * An on/off switch — a real `<input type="checkbox" role="switch">` (native
 * form participation, keyboard/click behavior for free), styled as Figma's
 * pill-shaped Switch. `role="switch"` overrides the implicit checkbox role
 * so assistive tech announces "on/off" rather than "checked/unchecked",
 * which is what this actually is — a real distinction, since Figma's own
 * Toggle and Checkbox are visually and semantically different controls even
 * though both boil down to a boolean.
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, size = "lg", labelPlacement = "right", className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  // `as="span"`, not the default `<label>` — the outer element this
  // returns is already a real `<label htmlFor>` wrapping the whole control,
  // and a `<label>` can't nest another `<label>` inside it.
  const labelElement = label ? (
    <FieldLabel as="span" size={size} className="ds-toggle__label">
      {label}
    </FieldLabel>
  ) : null;
  const controlElement = (
    <span className="ds-toggle__control">
      <input ref={ref} type="checkbox" role="switch" id={inputId} className="ds-toggle__input" {...rest} />
      <span className="ds-toggle__track" aria-hidden>
        <span className="ds-toggle__thumb" />
      </span>
    </span>
  );

  const labelFirst = labelPlacement === "left" || labelPlacement === "above";

  return (
    <label htmlFor={inputId} className={clsx("ds-toggle", `ds-toggle--${size}`, `ds-toggle--label-${labelPlacement}`, className)}>
      {labelFirst && labelElement}
      {controlElement}
      {!labelFirst && labelElement}
    </label>
  );
});
