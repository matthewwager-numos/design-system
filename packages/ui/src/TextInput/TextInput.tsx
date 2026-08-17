import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { clsx } from "clsx";
import { FieldLabel } from "../FieldLabel";
import "./TextInput.css";

export type TextInputSize = "sm" | "md" | "lg";
export type TextInputStatus = "default" | "error" | "success";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Field label, rendered above the input. */
  label?: ReactNode;
  /** Helper or validation text, rendered below the input. */
  helpText?: ReactNode;
  /** Validation state. Error/success also style the help text and its icon. */
  status?: TextInputStatus;
  /** Input size. */
  size?: TextInputSize;
  /** Optional icon to render before the input text. */
  leadingIcon?: ReactNode;
  /** Optional icon to render after the input text. */
  trailingIcon?: ReactNode;
}

/**
 * A labeled text field. Sizes map 1:1 to the Figma component variants
 * (S/M/L → sm/md/lg). Figma's Hover/Focus/Filled/Disabled "states" aren't
 * separate props here — they're real `:hover`, `:focus-within`,
 * `::placeholder`, and `:disabled` behavior, which is what they actually
 * are. Only validation state (`status`) is a prop, since that's real
 * app state a browser can't infer on its own.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, helpText, status = "default", size = "lg", leadingIcon, trailingIcon, className, id, disabled, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={clsx("ds-text-input", `ds-text-input--${size}`, className)}>
      {label ? (
        <FieldLabel size={size} htmlFor={inputId} className="ds-text-input__label">
          {label}
        </FieldLabel>
      ) : null}

      <div className={clsx("ds-text-input__field", `ds-text-input__field--${status}`)}>
        {leadingIcon ? <span className="ds-text-input__icon" aria-hidden>{leadingIcon}</span> : null}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className="ds-text-input__control"
          aria-invalid={status === "error" || undefined}
          {...rest}
        />
        {trailingIcon ? <span className="ds-text-input__icon" aria-hidden>{trailingIcon}</span> : null}
      </div>

      {helpText ? (
        <div className={clsx("ds-text-input__help", `ds-text-input__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}
    </div>
  );
});
