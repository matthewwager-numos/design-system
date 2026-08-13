import type { ReactNode } from "react";
import { clsx } from "clsx";
import { useSegmentedControlContext } from "./SegmentedControlContext";

export interface SegmentedControlOptionProps {
  value: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

/** One segment. Renders as `role="radio"` — Enter/Space activation is handled for you via native `<button>` semantics; `<SegmentedControl>` handles arrow-key navigation between segments. */
export function SegmentedControlOption({ value, leadingIcon, trailingIcon, disabled, children, className }: SegmentedControlOptionProps) {
  const { value: activeValue, setValue } = useSegmentedControlContext("SegmentedControlOption");
  const selected = value === activeValue;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-segment-value={value}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={clsx("ds-segment", selected && "ds-segment--selected", className)}
      onClick={() => setValue(value)}
    >
      {leadingIcon ? (
        <span className="ds-segment__icon" aria-hidden>
          {leadingIcon}
        </span>
      ) : null}
      <span className="ds-segment__label">{children}</span>
      {trailingIcon ? (
        <span className="ds-segment__icon" aria-hidden>
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
}
