import type { ReactNode } from "react";
import { clsx } from "clsx";

export interface FormHeaderProps {
  /** Title text. */
  children: ReactNode;
  /** Trailing icon buttons — Figma's example shows a row of small ghost icon buttons; pass your own (e.g. a close button). */
  actions?: ReactNode;
  className?: string;
}

/** `<Form>`'s title row, with an optional row of trailing icon-button actions. */
export function FormHeader({ children, actions, className }: FormHeaderProps) {
  return (
    <div className={clsx("ds-form-header", className)}>
      <p className="ds-form-header__title">{children}</p>
      {actions && <div className="ds-form-header__actions">{actions}</div>}
    </div>
  );
}
