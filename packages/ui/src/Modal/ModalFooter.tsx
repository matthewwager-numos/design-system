import type { ReactNode } from "react";
import { clsx } from "clsx";

export interface ModalFooterProps {
  /** Optional left-aligned action, separate from the main (right-aligned) actions — same pattern as `<FormFooter>`'s `secondaryAction`. */
  secondaryAction?: ReactNode;
  /** Right-aligned actions — typically a `<ButtonGroup>` of Cancel/Submit. */
  children: ReactNode;
  className?: string;
}

/** `<Modal>`'s action row: an optional secondary action on the left, primary actions on the right — mirrors `<FormFooter>`'s shape, since it's the same "footer with actions" pattern. */
export function ModalFooter({ secondaryAction, children, className }: ModalFooterProps) {
  return (
    <div className={clsx("ds-modal-footer", className)}>
      {secondaryAction}
      <div className="ds-modal-footer__actions">{children}</div>
    </div>
  );
}
