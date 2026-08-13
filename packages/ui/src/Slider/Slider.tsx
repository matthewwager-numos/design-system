import { useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { clsx } from "clsx";
import "./Slider.css";

export type SliderSize = "sm" | "md";

/** A single number for a one-thumb slider, or a `[min, max]` tuple for a two-thumb range slider. */
export type SliderValue = number | [number, number];

export interface SliderProps {
  /** Field label, rendered above the track alongside the current value(s). */
  label?: ReactNode;
  /** Figma only defines S/M for this component — there's no "lg" to match TextInput/Select. */
  size?: SliderSize;
  min?: number;
  max?: number;
  step?: number;
  /** Controlled value — a number, or a `[min, max]` tuple for a range slider. Omit to let Slider manage its own. */
  value?: SliderValue;
  defaultValue?: SliderValue;
  onValueChange?: (value: SliderValue) => void;
  /** Shows the formatted value(s) beside the label. Defaults to true. */
  showValue?: boolean;
  /** Formats a single thumb's value for display and for screen readers (`aria-valuetext`). Defaults to `${value}%`. */
  formatValue?: (value: number) => string;
  disabled?: boolean;
  /** Renders hidden native input(s) so the value participates in a real `<form>` submission — `name` alone for a single thumb, `${name}Min`/`${name}Max` for a range. */
  name?: string;
  className?: string;
}

function snapToStep(raw: number, anchor: number, step: number) {
  return anchor + Math.round((raw - anchor) / step) * step;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

const defaultFormatValue = (value: number) => `${value}%`;

/**
 * A track, fill, and one or two draggable thumbs — matches Figma's Slider
 * exactly (S/M sizes, Default/Hover/Disabled/Range states). Hover isn't a
 * prop here, it's real `:hover` on the track (same philosophy as
 * `<TextInput>`) — only whether it's a range slider is a real distinction,
 * and that's driven by `value`'s shape (`number` vs `[number, number]`)
 * rather than a separate `range` prop, since a two-thumb slider is really
 * just "how many thumbs does this have," which the value already encodes.
 *
 * Custom rather than a native `<input type="range">`: HTML has no native
 * two-thumb range input, so both variants need the same custom
 * implementation to share one API — real `role="slider"` thumbs (the
 * documented ARIA pattern for a two-thumb range is two adjacent sliders,
 * there's no dedicated "range" role), pointer-capture dragging, and the
 * standard slider keyboard set (arrows, Home/End, Page Up/Down).
 */
export function Slider({
  label,
  size = "md",
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  showValue = true,
  formatValue = defaultFormatValue,
  disabled = false,
  name,
  className,
}: SliderProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<SliderValue>(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const values = Array.isArray(value) ? value : [value];
  const isRange = values.length === 2;

  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const labelId = useId();

  function commit(nextValues: number[]) {
    const next: SliderValue = isRange ? [nextValues[0]!, nextValues[1]!] : nextValues[0]!;
    setUncontrolledValue(next);
    onValueChange?.(next);
  }

  // Each thumb's own allowed range — the other thumb's value for whichever
  // side it borders, min/max everywhere else. Generalizes single-thumb
  // (bounds are always [min, max]) and range (thumbs can't cross) alike.
  function bounds(index: number): [number, number] {
    const lo = index === 0 ? min : values[index - 1]!;
    const hi = index === values.length - 1 ? max : values[index + 1]!;
    return [lo, hi];
  }

  function setValueAt(index: number, raw: number) {
    const [lo, hi] = bounds(index);
    const next = clamp(snapToStep(raw, min, step), lo, hi);
    const nextValues = values.slice();
    nextValues[index] = next;
    commit(nextValues);
  }

  function valueFromClientX(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    const ratio = (clientX - rect.left) / rect.width;
    return clamp(min + ratio * (max - min), min, max);
  }

  function nearestIndex(raw: number) {
    if (values.length === 1) return 0;
    return Math.abs(raw - values[0]!) <= Math.abs(raw - values[1]!) ? 0 : 1;
  }

  function handleThumbPointerDown(index: number) {
    return (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus();
      setDraggingIndex(index);
      setValueAt(index, valueFromClientX(event.clientX));
    };
  }

  function handleThumbPointerMove(index: number) {
    return (event: ReactPointerEvent<HTMLDivElement>) => {
      if (draggingIndex !== index) return;
      setValueAt(index, valueFromClientX(event.clientX));
    };
  }

  function handleThumbPointerUp() {
    setDraggingIndex(null);
  }

  function handleTrackPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || event.target !== trackRef.current) return;
    const raw = valueFromClientX(event.clientX);
    setValueAt(nearestIndex(raw), raw);
  }

  function handleKeyDown(index: number) {
    return (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const [lo, hi] = bounds(index);
      const current = values[index]!;
      const bigStep = step * 10;

      let next: number | null = null;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = current + step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = current - step;
          break;
        case "PageUp":
          next = current + bigStep;
          break;
        case "PageDown":
          next = current - bigStep;
          break;
        case "Home":
          next = lo;
          break;
        case "End":
          next = hi;
          break;
        default:
          return;
      }
      event.preventDefault();
      setValueAt(index, clamp(next, lo, hi));
    };
  }

  const percentFor = (v: number) => ((v - min) / (max - min)) * 100;

  const fillStyle = isRange
    ? { left: `${percentFor(values[0]!)}%`, right: `${100 - percentFor(values[1]!)}%` }
    : { left: "0%", right: `${100 - percentFor(values[0]!)}%` };

  const displayValue = isRange ? `${formatValue(values[0]!)}–${formatValue(values[1]!)}` : formatValue(values[0]!);

  return (
    <div className={clsx("ds-slider", `ds-slider--${size}`, disabled && "ds-slider--disabled", className)}>
      {(label || showValue) && (
        <div className="ds-slider__label-row">
          {label && (
            <span className="ds-slider__label" id={labelId}>
              {label}
            </span>
          )}
          {showValue && <span className="ds-slider__value">{displayValue}</span>}
        </div>
      )}

      <div ref={trackRef} className="ds-slider__track" onPointerDown={handleTrackPointerDown}>
        <div className={clsx("ds-slider__fill", draggingIndex !== null && "ds-slider__fill--no-transition")} style={fillStyle} />
        {values.map((v, index) => (
          <div
            key={index}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={bounds(index)[0]}
            aria-valuemax={bounds(index)[1]}
            aria-valuenow={v}
            aria-valuetext={formatValue(v)}
            aria-orientation="horizontal"
            aria-disabled={disabled || undefined}
            aria-label={isRange ? `${label ? `${label} ` : ""}${index === 0 ? "minimum" : "maximum"}` : undefined}
            aria-labelledby={!isRange && label ? labelId : undefined}
            className={clsx("ds-slider__thumb", draggingIndex === index && "ds-slider__thumb--dragging")}
            style={{ left: `${percentFor(v)}%` }}
            onPointerDown={handleThumbPointerDown(index)}
            onPointerMove={handleThumbPointerMove(index)}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
            onKeyDown={handleKeyDown(index)}
          />
        ))}
      </div>

      {name && !isRange && <input type="hidden" name={name} value={values[0]} readOnly />}
      {name && isRange && (
        <>
          <input type="hidden" name={`${name}Min`} value={values[0]} readOnly />
          <input type="hidden" name={`${name}Max`} value={values[1]} readOnly />
        </>
      )}
    </div>
  );
}
