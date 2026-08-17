import type { ReactNode } from "react";
import { clsx } from "clsx";
import "./FieldLabel.css";

export type FieldLabelSize = "sm" | "md" | "lg";

export interface FieldLabelProps {
  /** Maps directly to Figma's own S/M/L variants — same `sm`/`md`/`lg` scale every input already uses. */
  size?: FieldLabelSize;
  /**
   * Which element this renders as. Defaults to a real `<label>` — pair
   * with `htmlFor` for a single field. Use `"legend"` inside a
   * `<fieldset>` (a group's label, e.g. `<RadioGroup>`/`<CheckboxGroup>`),
   * or `"span"` for a custom widget that associates its label via
   * `aria-labelledby` instead of `htmlFor` (e.g. `<Slider>`).
   */
  as?: "label" | "legend" | "span";
  /** `as="label"` only. */
  htmlFor?: string;
  id?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The text style every field's label uses — matches Figma's FieldLabel
 * exactly (S/M/L, all Paragraph Medium at the matching size, all
 * `content-emphasis`). Every input composes this rather than styling its
 * own label text independently, the same way `avatar`-type `<Cell>` composes
 * `<Avatar>` instead of reimplementing it — one place defines what a field
 * label looks like at each size, not nine.
 */
export function FieldLabel({ size = "md", as = "label", htmlFor, id, children, className }: FieldLabelProps) {
  const Component = as;
  return (
    <Component htmlFor={as === "label" ? htmlFor : undefined} id={id} className={clsx("ds-field-label", `ds-field-label--${size}`, className)}>
      {children}
    </Component>
  );
}
