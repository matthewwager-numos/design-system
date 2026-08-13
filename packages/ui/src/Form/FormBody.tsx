import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export interface FormBodyProps extends HTMLAttributes<HTMLDivElement> {}

/** `<Form>`'s field area — a vertical stack of form controls with consistent spacing between them. Not scrollable on its own; wrap it yourself if a form can outgrow its container. */
export function FormBody({ className, children, ...rest }: FormBodyProps) {
  return (
    <div className={clsx("ds-form-body", className)} {...rest}>
      {children}
    </div>
  );
}
