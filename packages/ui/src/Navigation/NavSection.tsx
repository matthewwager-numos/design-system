import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export interface NavSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * True for the main scrollable list (Figma's "Frame 197" — grows to fill
   * available height and scrolls independently). Omit for a section that
   * should stay pinned at its natural height instead (Figma's "Frame 198" —
   * typically the last section, holding `<NavUser>` and account links).
   */
  grow?: boolean;
}

/** A vertical group of <NavItem>s within <Navigation>. */
export function NavSection({ grow = false, className, children, ...rest }: NavSectionProps) {
  return (
    <div className={clsx("ds-nav-section", grow && "ds-nav-section--grow", className)} {...rest}>
      {children}
    </div>
  );
}
