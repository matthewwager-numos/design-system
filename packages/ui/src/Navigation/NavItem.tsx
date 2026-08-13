import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";
import { Tooltip } from "../Tooltip";
import { useNavigationContext } from "./NavigationContext";

export interface NavSubItem {
  label: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent) => void;
  /** Matches Figma's Tab-styled sub-item selection (a left-border indicator), not a real <Tab> — role="tab" would be the wrong semantics for a nav link. */
  active?: boolean;
}

export interface NavItemProps {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  /**
   * Turns this item into an expand/collapse disclosure revealing these
   * sub-links (Figma's "Expanded" state) instead of navigating anywhere
   * itself. Only shown while `<Navigation>` is expanded — collapsed, there's
   * no room for a flyout yet, so the item falls back to a plain icon +
   * tooltip like any other `<NavItem>`.
   */
  items?: NavSubItem[];
  defaultOpen?: boolean;
  className?: string;
}

/**
 * One sidebar link — an icon plus a label, matching Figma's Nav Item
 * (Default/Hover/Selected states). Renders as a real `<a href>` when `href`
 * is given, otherwise a `<button>`. While `<Navigation>` is collapsed, the
 * label moves into a `<Tooltip placement="right">` instead of disappearing.
 */
export function NavItem({ icon, children, href, selected = false, disabled = false, onClick, items, defaultOpen = false, className }: NavItemProps) {
  const { expanded } = useNavigationContext("NavItem");
  const [open, setOpen] = useState(defaultOpen);
  const subItems = expanded ? items : undefined;

  function handleClick(event: MouseEvent) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  const label = (
    <>
      <span className="ds-nav-item__icon" aria-hidden>
        {icon}
      </span>
      {expanded && <span className="ds-nav-item__label">{children}</span>}
    </>
  );

  const itemClassName = clsx("ds-nav-item", selected && "ds-nav-item--selected", disabled && "ds-nav-item--disabled", className);

  let trigger;
  if (subItems) {
    trigger = (
      <button type="button" disabled={disabled} aria-expanded={open} className={itemClassName} onClick={() => setOpen(!open)}>
        {label}
        {open ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
      </button>
    );
  } else if (href) {
    trigger = (
      <a href={disabled ? undefined : href} aria-disabled={disabled} aria-current={selected ? "page" : undefined} className={itemClassName} onClick={handleClick}>
        {label}
      </a>
    );
  } else {
    trigger = (
      <button type="button" disabled={disabled} aria-current={selected ? "page" : undefined} className={itemClassName} onClick={handleClick}>
        {label}
      </button>
    );
  }

  return (
    <div className="ds-nav-item-wrapper">
      {expanded ? (
        trigger
      ) : (
        <Tooltip content={children} placement="right">
          {trigger}
        </Tooltip>
      )}
      {subItems && subItems.length > 0 && (
        <div className="ds-nav-item__sublist" hidden={!open}>
          {subItems.map((item, index) => (
            <a key={index} href={item.href} onClick={item.onClick} className={clsx("ds-nav-subitem", item.active && "ds-nav-subitem--active")}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
