import { forwardRef, useId } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { clsx } from "clsx";
import { useRadioGroupContext } from "./RadioGroupContext";
import "./Radio.css";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  helpText?: ReactNode;
  /** Validation state — a prop for the same reason `<TextInput>`'s `status` and `<Checkbox>`'s `error` are: real app state a browser can't infer. */
  error?: boolean;
}

/**
 * A real `<input type="radio">`, styled the same way `<Checkbox>` is —
 * Figma's Hover/Focus/Checked/Disabled states are real CSS selectors, not
 * props. Meant to always be used inside a `<RadioGroup>`, which supplies
 * `name` and drives selection for you — a single, ungrouped radio button is
 * a UX anti-pattern (it doesn't communicate a mutually-exclusive choice on
 * its own; `<Checkbox>` already covers a standalone pending on/off setting
 * more clearly), so that usage isn't documented or demonstrated, even
 * though nothing here technically prevents it.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, helpText, error = false, className, id, value, checked, onChange, name, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const group = useRadioGroupContext();

  const resolvedChecked = group ? group.value === value : checked;
  const resolvedName = name ?? group?.name;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (group && typeof value === "string") group.onChange(value);
  }

  return (
    <div className={clsx("ds-radio", className)}>
      <span className="ds-radio__control">
        <input
          ref={ref}
          type="radio"
          id={inputId}
          name={resolvedName}
          value={value}
          checked={resolvedChecked}
          onChange={handleChange}
          aria-invalid={error || undefined}
          className={clsx("ds-radio__input", error && "ds-radio__input--error")}
          {...rest}
        />
        <span className="ds-radio__box" aria-hidden />
      </span>
      {(label || helpText) && (
        <span className="ds-radio__text">
          {label && (
            <label htmlFor={inputId} className="ds-radio__label">
              {label}
            </label>
          )}
          {helpText && (
            <span className={clsx("ds-radio__help", error && "ds-radio__help--error")}>
              {error && <TriangleAlert size={16} />}
              {helpText}
            </span>
          )}
        </span>
      )}
    </div>
  );
});
