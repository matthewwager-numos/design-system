import type { ReactNode } from "react";
import { clsx } from "clsx";
import { FieldLabel } from "../FieldLabel";
import "./Fieldset.css";

export type FieldsetSize = "sm" | "md" | "lg";

export interface FieldsetProps {
  /** The group's own label — a real `<legend>` (via `<FieldLabel as="legend">`), announced once by assistive tech rather than per field. */
  label: ReactNode;
  size?: FieldsetSize;
  /** The fields themselves — typically `<TextInput>`/`<Select>` used without their own `label`, distinguished by `placeholder` alone. Fieldset doesn't cascade `size` to them; pass it explicitly to each field too, same as everywhere else in this library. */
  children: ReactNode;
  className?: string;
}

/**
 * A single group label sitting above otherwise-unlabeled fields — matches
 * Figma's Fieldset exactly (an "Address" fieldset is its reference
 * example: one legend, then Street Address 1/2, City, State, Zip with only
 * placeholder text distinguishing them). The right choice when a group of
 * fields reads as one real-world concept and per-field labels would mostly
 * repeat what the placeholder already says — reach for individual
 * `label`s on each field instead when a group's fields aren't this
 * self-evident from context alone.
 *
 * A real `<fieldset>`/`<legend>` pair, not a styled `<div>` — same reasoning
 * as `<RadioGroup>`: assistive tech announces the group's label once,
 * rather than needing every field inside to repeat it in its own
 * `aria-label`.
 */
export function Fieldset({ label, size = "md", children, className }: FieldsetProps) {
  return (
    <fieldset className={clsx("ds-fieldset", `ds-fieldset--${size}`, className)}>
      <FieldLabel as="legend" size={size} className="ds-fieldset__legend">
        {label}
      </FieldLabel>
      <div className="ds-fieldset__fields">{children}</div>
    </fieldset>
  );
}

export interface FieldsetRowProps {
  /** Fields to lay out side by side, sharing the row's width equally — e.g. State + Zip. */
  children: ReactNode;
  className?: string;
}

/** A row of fields sharing one line within a `<Fieldset>` — e.g. State next to Zip. Purely a layout helper: it has no label or grouping semantics of its own, since its parent `<Fieldset>` already provides those for the whole group. */
export function FieldsetRow({ children, className }: FieldsetRowProps) {
  return <div className={clsx("ds-fieldset__row", className)}>{children}</div>;
}
