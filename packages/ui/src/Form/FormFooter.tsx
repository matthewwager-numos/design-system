import type { ReactNode } from "react";
import { clsx } from "clsx";

export interface FormFooterProps {
  /**
   * Optional left-aligned action, separate from the main (usually
   * right-aligned) actions — Figma's example shows a `<Button variant="link">`
   * here ("Tertiary"), for something like "Delete" or "Reset" that shouldn't
   * be grouped with Cancel/Submit.
   */
  secondaryAction?: ReactNode;
  /** Right-aligned actions — typically a `<ButtonGroup>` of Cancel/Submit. */
  children: ReactNode;
  className?: string;
}

/** `<Form>`'s action row: an optional secondary action on the left, primary actions on the right. */
export function FormFooter({ secondaryAction, children, className }: FormFooterProps) {
  return (
    <div className={clsx("ds-form-footer", className)}>
      {secondaryAction}
      <div className="ds-form-footer__actions">{children}</div>
    </div>
  );
}
