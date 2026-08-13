import type { FormHTMLAttributes } from "react";
import { clsx } from "clsx";
import "./Form.css";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {}

/**
 * A card-like container for `<FormHeader>`, `<FormBody>`, and
 * `<FormFooter>`. Renders a real `<form>` — Figma's Form is a static visual
 * shell, but everything it contains (`<TextInput>`, `<Select>`,
 * `<CheckboxGroup>`, `<RadioGroup>`, `<SegmentedControl>`, `<Toggle>`) is a
 * real form control, so this should behave like one: Enter-to-submit,
 * native `FormData` collection on submit, and so on.
 */
export function Form({ className, children, ...rest }: FormProps) {
  return (
    <form className={clsx("ds-form", className)} {...rest}>
      {children}
    </form>
  );
}
