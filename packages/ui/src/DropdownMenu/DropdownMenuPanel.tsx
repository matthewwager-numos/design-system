import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, TransitionEvent } from "react";
import { clsx } from "clsx";
import { useDropdownMenuContext } from "./DropdownMenuContext";

export interface DropdownMenuPanelProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * The "accommodates any input components" variant of a dropdown's content —
 * matches Figma's `Dropdown` `type="Filter"` variant: a plain padded panel,
 * not a `role="menu"` full of `role="menuitem"`s. Confirmed from Figma: this
 * one holds a `<CheckboxGroup>`, a `<Slider>`, and a date field stacked
 * together, none of which are "menu items" — they're real form controls
 * that need their own native focus/keyboard behavior (arrow keys should
 * move a slider, not navigate between rows), which `<DropdownMenuContent>`'s
 * `role="menu"` Arrow/Home/End handling would otherwise hijack. This
 * renders a plain, unstyled-role `<div>` instead, with only Escape wired up
 * (closing the panel), and doesn't move focus anywhere on open — unlike
 * `<DropdownMenuContent>`, which focuses its first item, there's no safe
 * assumption about what (if anything) inside arbitrary children should get
 * focus instead.
 */
export function DropdownMenuPanel({ className, children, onKeyDown, ...rest }: DropdownMenuPanelProps) {
  const { open, setOpen } = useDropdownMenuContext("DropdownMenuPanel");
  const panelRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setRendered(true);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open]);

  if (!rendered) return null;

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target === panelRef.current && !open) {
      setRendered(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div
      ref={panelRef}
      className={clsx("ds-dropdown-menu-panel", visible && "ds-dropdown-menu-panel--visible", className)}
      onKeyDown={handleKeyDown}
      onTransitionEnd={handleTransitionEnd}
      {...rest}
    >
      {children}
    </div>
  );
}
