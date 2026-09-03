import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, TransitionEvent } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { useDropdownMenuContext } from "./DropdownMenuContext";
import type { DropdownMenuSize } from "./DropdownMenuContext";
import { useAnchorRect } from "./useAnchorRect";
import { useDropdownMenuPlacement } from "./useDropdownMenuPlacement";

export interface DropdownMenuPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Defaults to the size set on the enclosing `<DropdownMenu>` — only needed here to override that for this one panel. */
  size?: DropdownMenuSize;
  /** Matches the panel's width to the trigger's own measured width — on by default, since a panel is almost always anchored to a full-width field (e.g. `<SearchFilter>`'s filters). */
  matchTriggerWidth?: boolean;
}

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
 *
 * Renders via a portal to `document.body`, positioned (and, by default,
 * width-matched) from the trigger's measured `getBoundingClientRect()` and
 * corrected for viewport collisions — same reasoning as
 * `<DropdownMenuContent>`'s own portal: CSS `position: absolute` in place
 * would otherwise get cropped by any clipping/scrolling ancestor (e.g. a
 * `<Modal>`'s own `overflow: hidden` panel).
 */
export function DropdownMenuPanel({ size: sizeProp, matchTriggerWidth = true, className, style, children, onKeyDown, ...rest }: DropdownMenuPanelProps) {
  const { open, setOpen, triggerRef, contentId, size: contextSize } = useDropdownMenuContext("DropdownMenuPanel");
  const size = sizeProp ?? contextSize;
  const panelRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(open);
  const anchor = useAnchorRect(triggerRef, rendered);
  const resolved = useDropdownMenuPlacement(panelRef, anchor, "bottom", matchTriggerWidth);

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

  if (!rendered || !anchor || !resolved) return null;

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

  return createPortal(
    <div
      ref={panelRef}
      id={contentId}
      data-theme={anchor.theme ?? undefined}
      className={clsx(
        "ds-dropdown-menu-panel",
        `ds-dropdown-menu-panel--${size}`,
        `ds-dropdown-menu-panel--${resolved.placement}`,
        visible && "ds-dropdown-menu-panel--visible",
        className,
      )}
      style={{ ...style, ...resolved.style }}
      onKeyDown={handleKeyDown}
      onTransitionEnd={handleTransitionEnd}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  );
}
