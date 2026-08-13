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
  /** Which side of the trigger the tooltip opens toward. Defaults to "top". */
  placement?: TooltipPlacement;
  /** "hover" (default, also opens on focus) or "click" to toggle on click/tap instead. */
  trigger?: TooltipTriggerMode;
  /** Controlled open state. Omit to let the tooltip manage its own hover/focus/click state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

interface Anchor {
  rect: DOMRect;
  /** The trigger's nearest `[data-theme]` ancestor, if any — reapplied to the portaled tooltip since portaling to <body> would otherwise escape it (e.g. <Navigation>'s forced dark theme). */
  theme: string | null;
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
  placement = "top",
  trigger = "hover",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
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

  useLayoutEffect(() => {
    if (!rendered) return;
    function measure() {
      const el = rootRef.current;
      if (!el) return;
      setAnchor({ rect: el.getBoundingClientRect(), theme: el.closest("[data-theme]")?.getAttribute("data-theme") ?? null });
    }
    measure();
    // The trigger can move without `open`/`placement` changing — a scroll on
    // any ancestor (capture: true catches those, since scroll doesn't
    // bubble) or a viewport resize — so keep re-measuring while mounted.
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [rendered, placement]);

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
            {title && <span className="ds-tooltip__title">{title}</span>}
            <span className="ds-tooltip__body">{content}</span>
            <span className="ds-tooltip__arrow" />
          </span>,
          document.body,
        )}
    </span>
  );
}
