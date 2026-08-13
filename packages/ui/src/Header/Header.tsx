import type { ReactNode } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import "./Header.css";

export type HeaderVariant = "app" | "modal";

export interface HeaderProps {
  /** "app" (default) matches Figma's larger page-level header; "modal" is the compact variant for a `<Modal>`/drawer/side panel. */
  variant?: HeaderVariant;
  /** Shown left of the title — typically an `<AppIcon>`. "app" only; Figma's "modal" variant has no icon slot. */
  icon?: ReactNode;
  title: ReactNode;
  /**
   * Shows a close (×) button and calls this when clicked. Placement matches
   * Figma exactly per variant: trailing (top-right, next to the title) for
   * "app", leading (before the title) for "modal".
   */
  onClose?: () => void;
  /** Extra content at the end of the title row (e.g. another icon button). */
  titleActions?: ReactNode;
  /** Content below the title — typically a `<TabList>` of `<Tab>`s. */
  subNav?: ReactNode;
  /**
   * Trailing content in the sub-nav row. "app" renders it inline next to
   * `subNav` (e.g. a small icon button); "modal" renders it full-width
   * (e.g. a search box or button group), matching Figma's own layout split.
   */
  actions?: ReactNode;
  className?: string;
}

/**
 * The top-of-page (or top-of-panel) element: a title, an optional leading
 * icon, and an optional row of sub-navigation below it — typically
 * `<Header>`'s own `subNav` filled with a `<TabList>` of `<Tab>`s.
 *
 * One component with a `variant` prop rather than separate components per
 * variant — matches Figma's own model (one "Header" component set, a
 * `Size` variant) and every other multi-variant component in this library
 * (`Button`'s `variant`, `Avatar`'s `type`, `Tabs`' `orientation`). Named
 * `variant`, not `size`, since "app" vs. "modal" aren't just bigger/smaller
 * versions of the same layout — they have different slots entirely (an
 * icon vs. not, a trailing vs. leading close button). Renamed from Figma's
 * own "Drawer" label since this same variant is what `<Modal>` uses for
 * both its "default" and "drawer" types, not just an actual drawer.
 */
export function Header({ variant = "app", icon, title, onClose, titleActions, subNav, actions, className }: HeaderProps) {
  const isApp = variant === "app";

  const closeButton = onClose ? (
    <button type="button" className="ds-header__icon-button" onClick={onClose} aria-label="Close">
      <X size={isApp ? 20 : 16} aria-hidden />
    </button>
  ) : null;

  return (
    <div className={clsx("ds-header", `ds-header--${variant}`, className)}>
      <div className="ds-header__title-row">
        {!isApp && closeButton}
        {isApp && icon && <span className="ds-header__icon">{icon}</span>}
        <p className="ds-header__title">{title}</p>
        {isApp && closeButton}
        {titleActions && <div className="ds-header__title-actions">{titleActions}</div>}
      </div>
      {(subNav || actions) && (
        <div className="ds-header__subnav-row">
          {subNav && <div className="ds-header__subnav">{subNav}</div>}
          {actions && <div className="ds-header__actions">{actions}</div>}
        </div>
      )}
    </div>
  );
}
