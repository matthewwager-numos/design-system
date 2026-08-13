import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { NavigationContext } from "./NavigationContext";
import { NumosLogomark, NumosWordmark } from "./NumosLogo";
import "./Navigation.css";

export interface NavigationProps {
  /** <NavSection>s of <NavItem>s (and one <NavUser>, typically in the last section). */
  children: ReactNode;
  /** Controlled expanded state. Omit to let Navigation manage its own collapse/expand. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/**
 * A collapsible sidebar of navigation links. Always dark — Figma's
 * Navigation component has no light-mode variant, so this hardcodes
 * `data-theme="dark"` rather than following the page's color scheme (unlike
 * `<Tooltip>`, which inverts *relative to* the current theme, this one is
 * unconditionally dark regardless of it).
 *
 * Collapsed, it shrinks to an icon-only rail — each `<NavItem>` shows its
 * label in a `<Tooltip placement="right">` instead. Matches Figma's own
 * collapse behavior: the header's arrow-left button collapses it; the
 * logomark itself (in place of the arrow) expands it back.
 */
export function Navigation({
  children,
  expanded: controlledExpanded,
  defaultExpanded = true,
  onExpandedChange,
  className,
}: NavigationProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded ?? uncontrolledExpanded;

  function setExpanded(next: boolean) {
    setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  }

  return (
    <NavigationContext.Provider value={{ expanded }}>
      <nav data-theme="dark" className={clsx("ds-navigation", !expanded && "ds-navigation--collapsed", className)}>
        <div className="ds-navigation__head">
          {expanded ? (
            <>
              <NumosWordmark className="ds-navigation__wordmark" />
              <button type="button" className="ds-navigation__collapse" onClick={() => setExpanded(false)} aria-label="Collapse navigation">
                <ArrowLeft size={24} aria-hidden />
              </button>
            </>
          ) : (
            <button type="button" className="ds-navigation__expand" onClick={() => setExpanded(true)} aria-label="Expand navigation">
              <NumosLogomark className="ds-navigation__logomark" />
            </button>
          )}
        </div>
        {children}
      </nav>
    </NavigationContext.Provider>
  );
}
