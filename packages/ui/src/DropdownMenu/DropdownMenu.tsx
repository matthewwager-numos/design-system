import { cloneElement, useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { DropdownMenuContext, useDropdownMenuContext } from "./DropdownMenuContext";
import { useAnchorRect } from "./useAnchorRect";
import "./DropdownMenu.css";

export type DropdownMenuSize = "sm" | "md" | "lg";

export interface DropdownMenuProps {
  children: ReactNode;
  /** Controlled open state. Omit to let the menu manage its own state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Root of a dropdown menu. Manages open state, closes on outside click and
 * Escape, and provides context to <DropdownMenuTrigger>/<DropdownMenuContent>.
 * Matches Figma's "Dropdown" + "Dropdown Option" components, plus the real
 * interactive behavior Figma doesn't specify — this is the same foundation
 * <Select> builds on.
 */
export function DropdownMenu({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const triggerRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, setOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentId }}>
      <div className="ds-dropdown-menu-root" ref={rootRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps {
  /** A single interactive element (e.g. <Button>) that opens/closes the menu. */
  children: ReactElement<any>;
}

/** Wires open/close + ARIA attributes onto its child via cloneElement — the child renders as-is, nothing extra is mounted. */
export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef, contentId } = useDropdownMenuContext("DropdownMenuTrigger");

  return cloneElement(children, {
    ref: triggerRef,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      setOpen(!open);
    },
  });
}

export type DropdownMenuPlacement = "bottom" | "top";

/**
 * Fixed-position coordinates for a portaled panel, left-aligned to the
 * trigger's own left edge — "bottom" opens below it (`top` from the
 * trigger's bottom edge), "top" opens above it (`bottom` from the
 * trigger's top edge, measured from the viewport's own bottom so the panel
 * doesn't need its own height known up front).
 */
export function getFixedPosition(placement: DropdownMenuPlacement, rect: DOMRect): CSSProperties {
  const base = { left: `${rect.left}px` };
  return placement === "bottom"
    ? { ...base, top: `calc(${rect.bottom}px + var(--space-1))` }
    : { ...base, bottom: `calc(${window.innerHeight - rect.top}px + var(--space-1))` };
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLUListElement> {
  size?: DropdownMenuSize;
  /** Which side of the trigger the panel opens toward. Defaults to "bottom". No viewport collision detection — see "Not handled yet" below. */
  placement?: DropdownMenuPlacement;
}

/**
 * The menu panel. Supports Arrow/Home/End/Escape keyboard navigation.
 *
 * Stays mounted for the duration of the close transition instead of
 * unmounting the instant `open` flips false — otherwise there's nothing left
 * in the DOM to animate. `rendered` controls mounting; `visible` controls the
 * open/closed CSS state, flipped a frame after mount so the enter transition
 * actually animates from the closed state instead of appearing pre-opened.
 *
 * Renders via a portal to `document.body`, positioned from the trigger's
 * measured `getBoundingClientRect()` (see `useAnchorRect`) rather than CSS
 * `position: absolute` in place — otherwise any clipping/scrolling ancestor
 * (a `<Modal>`'s own `overflow: hidden` panel, a scrollable table) would
 * crop the panel the instant it extends past that ancestor's box, same
 * reasoning as `<Tooltip>`'s own portal.
 */
export function DropdownMenuContent({ size = "lg", placement = "bottom", className, children, onKeyDown, ...rest }: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef, contentId } = useDropdownMenuContext("DropdownMenuContent");
  const listRef = useRef<HTMLUListElement>(null);
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(open);
  const anchor = useAnchorRect(triggerRef, rendered);

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

  useEffect(() => {
    if (!open) return;
    const items = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)');
    items?.[0]?.focus();
  }, [open]);

  if (!rendered || !anchor) return null;

  function handleTransitionEnd(event: React.TransitionEvent<HTMLUListElement>) {
    if (event.target === listRef.current && !open) {
      setRendered(false);
    }
  }

  function getItems() {
    return Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    onKeyDown?.(event);
    const items = getItems();
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  }

  return createPortal(
    <ul
      ref={listRef}
      id={contentId}
      role="menu"
      data-theme={anchor.theme ?? undefined}
      className={clsx("ds-dropdown-menu", `ds-dropdown-menu--${size}`, `ds-dropdown-menu--${placement}`, visible && "ds-dropdown-menu--visible", className)}
      style={getFixedPosition(placement, anchor.rect)}
      onKeyDown={handleKeyDown}
      onTransitionEnd={handleTransitionEnd}
      {...rest}
    >
      {children}
    </ul>,
    document.body,
  );
}
