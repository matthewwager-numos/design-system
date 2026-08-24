import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, MouseEvent, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import "./Tooltip.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipTriggerMode = "hover" | "click";

export interface TooltipProps {
  /** A single element the tooltip attaches to — wired up via cloneElement, nothing extra is mounted around it. */
  children: ReactElement<any>;
  /** Body text — Figma's "Body" text layer. */
  content: ReactNode;
  /** Optional heading above the body — Figma's "Title" text layer, hidden unless set. */
  title?: ReactNode;
  /**
   * A small color swatch shown beside the title (or the body, if there's no
   * title) — e.g. a chart series' own color, so the tooltip visually ties
   * back to what's hovered. Omit for no dot.
   */
  dotColor?: string;
  /** Which side of the trigger the tooltip opens toward. Defaults to "top". */
  placement?: TooltipPlacement;
  /** "hover" (default, also opens on focus) or "click" to toggle on click/tap instead. */
  trigger?: TooltipTriggerMode;
  /** Controlled open state. Omit to let the tooltip manage its own hover/focus/click state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /**
   * Anchor to this viewport point instead of measuring `children`'s own
   * `getBoundingClientRect()` — for triggers with no meaningful box of
   * their own, e.g. a cursor position a chart tooltip tracks. `children` is
   * still required (and still receives the hover/focus/click wiring below)
   * since its nearest `[data-theme]` ancestor is still read from it, but
   * its layout position and size are ignored in favor of this point.
   */
  anchorPoint?: { x: number; y: number };
}

interface Anchor {
  rect: DOMRect;
  /** The trigger's nearest `[data-theme]` ancestor, if any — reapplied to the portaled tooltip since portaling to <body> would otherwise escape it (e.g. <Navigation>'s forced dark theme). */
  theme: string | null;
}

function rectsEqual(a: DOMRect, b: DOMRect): boolean {
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

function getPosition(placement: TooltipPlacement, rect: DOMRect): CSSProperties {
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
// resting spot as it fades in — see Tooltip.mdx's Behavior section.
function getTransform(placement: TooltipPlacement, visible: boolean): string {
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
 * A description or extra bit of info about an element, shown on hover/focus
 * (or click, via `trigger="click"`) and dismissed with Escape. Matches
 * Figma's Tooltip component: a "Body" line, an optional "Title" line above
 * it, and a single arrow pointing back at the trigger from whichever side
 * `placement` puts the tooltip on.
 *
 * Renders via a portal to `document.body`, positioned from the trigger's
 * measured `getBoundingClientRect()` rather than CSS `position: absolute` in
 * place — otherwise any scrolling/clipping ancestor (e.g. a scrollable
 * sidebar section) would crop the tooltip the instant it extends past that
 * ancestor's own box, regardless of z-index.
 */
export function Tooltip({
  children,
  content,
  title,
  dotColor,
  placement = "top",
  trigger = "hover",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  anchorPoint,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const rootRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  function setOpen(next: boolean) {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  // Stays mounted for the duration of the close transition instead of
  // unmounting the instant `open` flips false — otherwise there's nothing
  // left in the DOM to animate. `rendered` controls mounting; `visible`
  // controls the fade/slide CSS state, flipped a frame after mount so the
  // enter transition actually animates from the closed state instead of
  // appearing pre-opened.
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

  // `anchorPoint` skips measuring `children` entirely — its own box is
  // irrelevant when the tooltip is meant to track an arbitrary point (e.g.
  // the cursor) instead of a real trigger element. `[data-theme]` is still
  // read from `children`'s own DOM node regardless, since that lookup is a
  // plain ancestor walk unaffected by whichever positioning `children` uses.
  function measureAnchor(): Anchor | null {
    const el = rootRef.current;
    if (!el) return null;
    const theme = el.closest("[data-theme]")?.getAttribute("data-theme") ?? null;
    const rect = anchorPoint ? new DOMRect(anchorPoint.x, anchorPoint.y, 0, 0) : el.getBoundingClientRect();
    return { rect, theme };
  }

  function applyAnchor(next: Anchor | null) {
    if (!next) return;
    setAnchor((prev) => (prev && prev.theme === next.theme && rectsEqual(prev.rect, next.rect) ? prev : next));
  }

  // Re-measures after every render (no dependency array), not just on mount
  // — a trigger can move without `open`/`placement` changing, e.g.
  // `anchorPoint` tracking the cursor as its caller's state updates on
  // mousemove. Bails out via the functional setState form when the rect is
  // unchanged, so this doesn't loop: same rect in ⇒ same object out ⇒ React
  // skips the re-render that would otherwise re-trigger this effect.
  useLayoutEffect(() => {
    if (!rendered) return;
    applyAnchor(measureAnchor());
  });

  useLayoutEffect(() => {
    if (!rendered) return;
    function measure() {
      applyAnchor(measureAnchor());
    }
    // The trigger can also move for reasons outside our own render cycle —
    // a scroll on any ancestor (capture: true catches those, since scroll
    // doesn't bubble) or a viewport resize.
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [rendered]);

  function handleTransitionEnd(event: React.TransitionEvent<HTMLSpanElement>) {
    if (event.target === tooltipRef.current && !open) setRendered(false);
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (trigger !== "click" || !open) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
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
          onFocus: (event: FocusEvent) => {
            children.props.onFocus?.(event);
            setOpen(true);
          },
          onBlur: (event: FocusEvent) => {
            children.props.onBlur?.(event);
            setOpen(false);
          },
        };

  const triggerElement = cloneElement(children, {
    "aria-describedby": open ? tooltipId : undefined,
    ...triggerHandlers,
  });

  return (
    <span className="ds-tooltip-root" ref={rootRef}>
      {triggerElement}
      {rendered &&
        anchor &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            id={tooltipId}
            data-theme={anchor.theme ?? undefined}
            className={clsx("ds-tooltip", `ds-tooltip--${placement}`, visible && "ds-tooltip--visible", className)}
            style={{ ...getPosition(placement, anchor.rect), transform: getTransform(placement, visible) }}
            onTransitionEnd={handleTransitionEnd}
          >
            {(title !== undefined || dotColor) && (
              <span className="ds-tooltip__title">
                {dotColor && <span className="ds-tooltip__dot" style={{ background: dotColor }} aria-hidden="true" />}
                {title}
              </span>
            )}
            <span className="ds-tooltip__body">{content}</span>
            <span className="ds-tooltip__arrow" />
          </span>,
          document.body,
        )}
    </span>
  );
}
