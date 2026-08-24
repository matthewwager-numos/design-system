import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { X } from "lucide-react";
import "./Popover.css";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";
export type PopoverTriggerMode = "click" | "hover";

export interface PopoverProps {
  /** A single element the popover attaches to — wired up via cloneElement, same pattern as `<Tooltip>`. */
  children: ReactElement<any>;
  /** Figma's "Title" text layer — omit for no header row (the close button, if shown, moves to its own row). */
  title?: ReactNode;
  /** Figma's "Body text" layer. */
  content: ReactNode;
  /** Figma's "ButtonGroup", hidden by default in Figma — e.g. a `<ButtonGroup>` of Cancel/Confirm `<Button>`s. Omit for no footer. */
  actions?: ReactNode;
  /**
   * The header's close (×) button. Defaults to true — omit only if
   * `actions` (or something else) already gives the user a way to dismiss
   * it. Always suppressed when `trigger="hover"` regardless of this prop:
   * a hover-triggered popover already dismisses itself when the pointer
   * leaves, so a persistent close button doesn't fit that interaction.
   */
  showClose?: boolean;
  /** Which side of the trigger the popover opens toward — matches Figma's four Point-* arrow variants. Defaults to "top". */
  placement?: PopoverPlacement;
  /** "click" (default — a Popover is a persistent, dismissible panel, not a hover hint like `<Tooltip>`) or "hover". */
  trigger?: PopoverTriggerMode;
  /** Controlled open state. Omit to let the popover manage its own click/hover state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

interface Anchor {
  rect: DOMRect;
  /** The trigger's nearest `[data-theme]` ancestor, if any — reapplied to the portaled popover since portaling to <body> would otherwise escape it (e.g. <Navigation>'s forced dark theme). */
  theme: string | null;
}

function rectsEqual(a: DOMRect, b: DOMRect): boolean {
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

function getPosition(placement: PopoverPlacement, rect: DOMRect): CSSProperties {
  switch (placement) {
    case "top":
      return { top: `calc(${rect.top}px - var(--space-2))`, left: `${rect.left + rect.width / 2}px` };
    case "bottom":
      return { top: `calc(${rect.bottom}px + var(--space-2))`, left: `${rect.left + rect.width / 2}px` };
    case "left":
      return { top: `${rect.top + rect.height / 2}px`, left: `calc(${rect.left}px - var(--space-2))` };
    case "right":
      return { top: `${rect.top + rect.height / 2}px`, left: `calc(${rect.right}px + var(--space-2))` };
  }
}

// Closed: offset var(--space-1) toward the trigger; open: settles into its
// resting spot as it fades in — same technique as <Tooltip>'s own transform.
function getTransform(placement: PopoverPlacement, visible: boolean): string {
  const offset = visible ? "0px" : "var(--space-1)";
  const negOffset = visible ? "0px" : "calc(-1 * var(--space-1))";
  switch (placement) {
    case "top":
      return `translate(-50%, -100%) translateY(${offset})`;
    case "bottom":
      return `translate(-50%, 0%) translateY(${negOffset})`;
    case "left":
      return `translate(-100%, -50%) translateX(${offset})`;
    case "right":
      return `translate(0%, -50%) translateX(${negOffset})`;
  }
}

/**
 * A persistent, dismissible panel anchored to a trigger — matches Figma's
 * Popover exactly: a title + close (×) button row, a body row, an optional
 * footer action row (Figma's own "ButtonGroup", hidden unless `actions` is
 * given), and a single arrow pointing back at the trigger from whichever
 * side `placement` puts the panel on.
 *
 * Shares `<Tooltip>`'s positioning engine (portal to `document.body`,
 * positioned from the trigger's measured `getBoundingClientRect()` so a
 * scrolling/clipping ancestor can't crop it) but isn't built on top of it —
 * a Popover's header/body/footer content and click-by-default, explicitly-
 * dismissed interaction model are different enough from a hover hint that
 * forcing them through the same component would mean smuggling structured
 * markup through a `content: ReactNode` slot meant for a line of text.
 */
export function Popover({
  children,
  title,
  content,
  actions,
  showClose = true,
  placement = "top",
  trigger = "click",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const titleId = useId();

  function setOpen(next: boolean) {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  // Stays mounted for the duration of the close transition instead of
  // unmounting the instant `open` flips false — same mount/visible split
  // used by <Tooltip>/<DropdownMenu>/<Modal>.
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(open);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

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

  function measureAnchor(): Anchor | null {
    const el = rootRef.current;
    if (!el) return null;
    return { rect: el.getBoundingClientRect(), theme: el.closest("[data-theme]")?.getAttribute("data-theme") ?? null };
  }

  function applyAnchor(next: Anchor | null) {
    if (!next) return;
    setAnchor((prev) => (prev && prev.theme === next.theme && rectsEqual(prev.rect, next.rect) ? prev : next));
  }

  // Re-measures after every render (no dependency array), not just on mount
  // — see <Tooltip>'s own identical effect for why (bails out via the
  // functional setState form when the rect is unchanged, so this doesn't
  // loop).
  useLayoutEffect(() => {
    if (!rendered) return;
    applyAnchor(measureAnchor());
  });

  useLayoutEffect(() => {
    if (!rendered) return;
    function measure() {
      applyAnchor(measureAnchor());
    }
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [rendered]);

  function handleTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.target === popoverRef.current && !open) setRendered(false);
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close(true);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (trigger !== "click" || !open) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target) && popoverRef.current && !popoverRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [trigger, open]);

  const triggerHandlers =
    trigger === "click"
      ? {
          onClick: (event: MouseEvent) => {
            children.props.onClick?.(event);
            setOpen(!open);
          },
        }
      : {
          onMouseEnter: (event: MouseEvent) => {
            children.props.onMouseEnter?.(event);
            setOpen(true);
          },
          onMouseLeave: (event: MouseEvent) => {
            children.props.onMouseLeave?.(event);
            setOpen(false);
          },
        };

  const triggerElement = cloneElement(children, {
    ref: triggerRef,
    "aria-describedby": open ? popoverId : undefined,
    ...triggerHandlers,
  });

  const hasTitle = title !== undefined;
  const shouldShowClose = showClose && trigger !== "hover";
  const closeButton = shouldShowClose ? (
    <button type="button" className="ds-popover__close" onClick={() => close(true)} aria-label="Close">
      <X size={16} aria-hidden />
    </button>
  ) : null;
  const bodyElement = <div className="ds-popover__body">{content}</div>;

  return (
    <span className="ds-popover-root" ref={rootRef}>
      {triggerElement}
      {rendered &&
        anchor &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            id={popoverId}
            aria-labelledby={hasTitle ? titleId : undefined}
            data-theme={anchor.theme ?? undefined}
            className={clsx("ds-popover", `ds-popover--${placement}`, visible && "ds-popover--visible", className)}
            style={{ ...getPosition(placement, anchor.rect), transform: getTransform(placement, visible) }}
            onTransitionEnd={handleTransitionEnd}
          >
            {hasTitle ? (
              <>
                <div className="ds-popover__head">
                  <p className="ds-popover__title" id={titleId}>
                    {title}
                  </p>
                  {closeButton}
                </div>
                {bodyElement}
              </>
            ) : closeButton ? (
              // No title to give the close button its own row — the body
              // flows into that row instead of leaving it empty above the
              // body text.
              <div className="ds-popover__head ds-popover__head--body">
                {bodyElement}
                {closeButton}
              </div>
            ) : (
              bodyElement
            )}
            {actions && <div className="ds-popover__actions">{actions}</div>}
            <span className="ds-popover__arrow" />
          </div>,
          document.body,
        )}
    </span>
  );
}
