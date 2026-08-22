import { useState } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { CardGroupContext } from "./CardGroupContext";
import type { CardGroupType } from "./CardGroupContext";
import "./CardGroup.css";

export interface CardGroupProps {
  /** `<Card>`s — each needs its own `value` for `type="single"` to identify it; `type="multiple"` doesn't use `value` at all. */
  children: ReactNode;
  /**
   * `"single"` (default) coordinates selection the way `<RadioGroup>` does
   * for `<Radio>`: selecting one `<Card>` deselects any other, driven by
   * `value`/`onValueChange` below. `"multiple"` is the `<CheckboxGroup>`
   * side of that same distinction — there's no shared value to coordinate
   * (each `<Card>` just toggles its own `selected`/`onClick`, same as a
   * bare `<Checkbox>`), so in that mode this is really just a layout
   * wrapper, same as `<CheckboxGroup>` itself only ever shares layout/size,
   * never selection state.
   */
  type?: CardGroupType;
  /** `type="single"` only — controlled selected `<Card>`'s `value`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * A wrapping, gapped layout for a set of `<Card>`s that also coordinates
 * their selection — matches the same "single vs. multiple" distinction
 * `<RadioGroup>`/`<CheckboxGroup>` already draw, applied to `<Card>`'s own
 * `selected` state instead of a native input's `checked`.
 */
export function CardGroup({ children, type = "single", value: controlledValue, defaultValue, onValueChange, className }: CardGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;

  function handleSelect(next: string) {
    setUncontrolledValue(next);
    onValueChange?.(next);
  }

  return (
    <CardGroupContext.Provider value={{ type, value: type === "single" ? value : undefined, onSelect: handleSelect }}>
      <div role="group" className={clsx("ds-card-group", className)}>
        {children}
      </div>
    </CardGroupContext.Provider>
  );
}
