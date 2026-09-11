import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * `<Modal>`'s content area — grows to fill remaining space within the
 * panel and scrolls independently if its content overflows, so the
 * header/footer stay put. Forwards its ref to the real scrolling
 * `<div>` — needed by anything that has to measure or observe scroll
 * position within it directly (e.g. `useScrollSpy`'s `containerRef`,
 * since that has to be the actual scrolling ancestor, not the viewport).
 */
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(function ModalBody({ className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={clsx("ds-modal-body", className)} {...rest}>
      {children}
    </div>
  );
});
