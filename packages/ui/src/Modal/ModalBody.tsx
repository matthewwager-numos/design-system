import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

/** `<Modal>`'s content area — grows to fill remaining space within the panel and scrolls independently if its content overflows, so the header/footer stay put. */
export function ModalBody({ className, children, ...rest }: ModalBodyProps) {
  return (
    <div className={clsx("ds-modal-body", className)} {...rest}>
      {children}
    </div>
  );
}
