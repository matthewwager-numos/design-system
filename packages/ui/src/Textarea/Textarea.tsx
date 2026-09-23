import { forwardRef, useId } from "react";
import type { ReactNode, TextareaHTMLAttributes } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { clsx } from "clsx";
import { FieldLabel } from "../FieldLabel";
import "./Textarea.css";

export type TextareaSize = "sm" | "md" | "lg";
export type TextareaStatus = "default" | "error" | "success";

// "prefix" is omitted because `HTMLAttributes` already declares it as the
// (obscure, unrelated) RDFa `prefix` attribute typed `string` — this
// component's own `prefix` is a `ReactNode` render slot, not that.
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "prefix"> {
  /** Field label, rendered above the textarea. */
  label?: ReactNode;
  /** Helper or validation text, rendered below the textarea. */
  helpText?: ReactNode;
  /** Validation state. Error/success also style the help text and its icon. */
  status?: TextareaStatus;
  size?: TextareaSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /**
   * Fixed text rendered immediately before the value — e.g. a currency
   * symbol. Unlike `leadingIcon`, this is real content (not `aria-hidden`),
   * so a screen reader reads it as part of the field. Not shown by default.
   */
  prefix?: ReactNode;
  /** Fixed text rendered immediately after the value. Same real-content reasoning as `prefix`. */
  suffix?: ReactNode;
}

/**
 * A labeled multi-line text field — `<TextInput>`'s structure and token
 * scale, unchanged, with a `<textarea>` in place of the `<input>`. Confirmed
 * against Figma directly: Textarea's L size uses the exact same padding,
 * radius, and type tokens as TextInput's `lg`, so this mirrors it rather
 * than inventing a parallel scale. Icons align to the top instead of center,
 * since a multi-line field's first line is the meaningful anchor point.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helpText, status = "default", size = "lg", leadingIcon, trailingIcon, prefix, suffix, className, id, disabled, rows = 3, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={clsx("ds-textarea", `ds-textarea--${size}`, className)}>
      {label ? (
        <FieldLabel size={size} htmlFor={inputId} className="ds-textarea__label">
          {label}
        </FieldLabel>
      ) : null}

      <div className={clsx("ds-textarea__field", `ds-textarea__field--${status}`)}>
        {leadingIcon ? <span className="ds-textarea__icon" aria-hidden>{leadingIcon}</span> : null}
        {prefix ? <span className="ds-textarea__affix">{prefix}</span> : null}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          className="ds-textarea__control"
          aria-invalid={status === "error" || undefined}
          // Off by default — see <TextInput>'s own doc comment for why.
          autoComplete="off"
          {...rest}
        />
        {suffix ? <span className="ds-textarea__affix">{suffix}</span> : null}
        {trailingIcon ? <span className="ds-textarea__icon" aria-hidden>{trailingIcon}</span> : null}
      </div>

      {helpText ? (
        <div className={clsx("ds-textarea__help", `ds-textarea__help--${status}`)}>
          {status === "error" ? <TriangleAlert size={16} /> : null}
          {status === "success" ? <Check size={16} /> : null}
          <span>{helpText}</span>
        </div>
      ) : null}
    </div>
  );
});
