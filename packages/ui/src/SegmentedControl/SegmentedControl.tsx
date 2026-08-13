import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { clsx } from "clsx";
import { SegmentedControlContext } from "./SegmentedControlContext";
import "./SegmentedControl.css";

export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentedControlProps {
  /** `<SegmentedControlOption>`s. */
  children: ReactNode;
  size?: SegmentedControlSize;
  /** Controlled selected value — matches an option's `value`. Omit to let it manage its own selection. */
  value?: string;
  /** There's no selection at all until one of these is set — same as `<Tabs>`, it doesn't auto-select the first option. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Renders a hidden native input so the value participates in a real `<form>` submission — same pattern as `<Select>`'s `name`. */
  name?: string;
  className?: string;
}

/**
 * A single-choice control styled as connected pill segments — matches
 * Figma's Segmented Control. Implements the WAI-ARIA `radiogroup`/`radio`
 * pattern (this is fundamentally a mutually-exclusive choice, the same as
 * `<RadioGroup>`, just styled as buttons) with the same roving-tabindex,
 * automatic-activation keyboard behavior as `<TabList>`: arrow keys move
 * focus and select in one step.
 */
export function SegmentedControl({ children, size = "lg", value: controlledValue, defaultValue, onValueChange, name, className }: SegmentedControlProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolledValue;
  const listRef = useRef<HTMLDivElement>(null);

  function setValue(next: string) {
    setUncontrolledValue(next);
    onValueChange?.(next);
  }

  function getOptions() {
    return Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? []);
  }

  function activate(options: HTMLButtonElement[], index: number) {
    const option = options[index];
    if (!option) return;
    option.focus();
    setValue(option.dataset.segmentValue ?? "");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const options = getOptions();
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        activate(options, (currentIndex + 1) % options.length);
        break;
      case "ArrowLeft":
        event.preventDefault();
        activate(options, (currentIndex - 1 + options.length) % options.length);
        break;
      case "Home":
        event.preventDefault();
        activate(options, 0);
        break;
      case "End":
        event.preventDefault();
        activate(options, options.length - 1);
        break;
    }
  }

  return (
    <SegmentedControlContext.Provider value={{ value, setValue }}>
      <div
        ref={listRef}
        role="radiogroup"
        className={clsx("ds-segmented-control", `ds-segmented-control--${size}`, className)}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
      {name ? <input type="hidden" name={name} value={value} readOnly /> : null}
    </SegmentedControlContext.Provider>
  );
}
