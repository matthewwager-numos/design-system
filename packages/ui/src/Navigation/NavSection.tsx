import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

export interface NavSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * True for the main scrollable list (Figma's "Frame 197" — grows to fill
   * available height and scrolls independently). Omit for a section that
   * should stay pinned at its natural height instead (Figma's "Frame 198" —
   * typically the last section, holding `<NavUser>` and account links).
   */
  grow?: boolean;
  /**
   * A small heading rendered above this section's own items — e.g.
   * "Record" grouping several related workflow apps. Omit for an unlabeled
   * section (a plain group of items with no heading). When `<Navigation>`
   * is collapsed to its icon-only rail, there's no room for the words
   * themselves — the label collapses to a plain hairline rule instead (the
   * text stays present for assistive tech, just visually hidden; see
   * `.ds-navigation--collapsed .ds-nav-section__label-text` in the CSS).
   */
  label?: ReactNode;
}

/** A vertical group of <NavItem>s within <Navigation>. */
export function NavSection({ grow = false, label, className, children, ...rest }: NavSectionProps) {
  return (
    <div className={clsx("ds-nav-section", grow && "ds-nav-section--grow", className)} {...rest}>
      {label ? (
        <div className="ds-nav-section__label">
          <span className="ds-nav-section__label-text">{label}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
