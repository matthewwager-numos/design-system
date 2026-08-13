import { forwardRef, useEffect, useRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Check, Minus, TriangleAlert } from "lucide-react";
import { clsx } from "clsx";
import "./Checkbox.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Field label, rendered next to the box. */
  label?: ReactNode;
  /** Helper or validation text, rendered below the label. */
  helpText?: ReactNode;
  /** Validation state — real app state a browser can't infer, so (like `<TextInput>`'s `status`) it's the one thing here that's a prop rather than native behavior. */
  error?: boolean;
  /** A third visual state for "some, not all, of this group's children are checked" — sets the real DOM `indeterminate` property (there's no HTML attribute for it), independent of `checked`. */
  indeterminate?: boolean;
}

/**
 * A real `<input type="checkbox">` with Figma's box styling layered on via
 * a sibling element and `:checked`/`:indeterminate`/`:disabled`/
 * `:focus-visible` selectors — Hover/Focus/Checked aren't props here, they're
 * what they actually are, same philosophy as `<TextInput>`.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, helpText, error = false, indeterminate = false, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const internalRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (internalRef.current) internalRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={clsx("ds-checkbox", className)}>
      <span className="ds-checkbox__control">
        <input
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          type="checkbox"
          id={inputId}
          aria-invalid={error || undefined}
          className={clsx("ds-checkbox__input", error && "ds-checkbox__input--error")}
          {...rest}
        />
        <span className="ds-checkbox__box" aria-hidden>
          <Check className="ds-checkbox__icon ds-checkbox__icon--check" />
          <Minus className="ds-checkbox__icon ds-checkbox__icon--indeterminate" />
        </span>
      </span>
      {(label || helpText) && (
        <span className="ds-checkbox__text">
          {label && (
            <label htmlFor={inputId} className="ds-checkbox__label">
              {label}
            </label>
          )}
          {helpText && (
            <span className={clsx("ds-checkbox__help", error && "ds-checkbox__help--error")}>
              {error && <TriangleAlert size={16} />}
              {helpText}
            </span>
          )}
        </span>
      )}
    </div>
  );
});
