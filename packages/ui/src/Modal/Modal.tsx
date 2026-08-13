import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import "./Modal.css";

export type ModalVariant = "default" | "drawer";
export type ModalSide = "top" | "right" | "bottom" | "left";

const FOCUSABLE_SELECTOR =
  'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onClick"> {
  /** `<Header variant="modal">`, then whatever body/footer content — see `<ModalBody>`/`<ModalFooter>`. */
  children: ReactNode;
  /** "default" (centered, fades in while scaling from center) or "drawer" (slides in from `side`). Matches Figma's two Modal types. */
  variant?: ModalVariant;
  /** Which edge a "drawer" slides in from. Ignored for "default". */
  side?: ModalSide;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Clicking the backdrop closes the modal. Escape always closes it regardless of this — that's a keyboard-accessibility affordance, not a "casual dismiss" one. Defaults to true; set false for a modal that can only be closed by an explicit action (e.g. a destructive confirmation). */
  closeOnOverlayClick?: boolean;
  className?: string;
}

/**
 * A centered dialog or edge-anchored drawer, portaled to `document.body`
 * over a backdrop — matches Figma's Modal (Default/Drawer types) exactly:
 * same background/shadow/radius tokens (no radius for "drawer", matching
 * Figma's own square-cornered drawer frame), same header/body/footer
 * divider borders once you fill them with `<Header variant="modal">`
 * (renamed from Figma's "Drawer" label — this exact variant is what both
 * Modal types use for their header, not just an actual drawer) /
 * `<ModalBody>` / `<ModalFooter>`.
 *
 * Real interactive behavior Figma's static frames don't specify: Escape and
 * (optionally) an outside click close it, background scroll locks while
 * it's open, focus moves into it on open and is trapped there (Tab/
 * Shift+Tab cycle within it) until it closes, and focus returns to
 * whatever triggered it afterward.
 */
export function Modal({
  children,
  variant = "default",
  side = "right",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnOverlayClick = true,
  className,
  ...rest
}: ModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  function setOpen(next: boolean) {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<string | undefined>();

  // Stays mounted for the duration of the close transition instead of
  // unmounting the instant `open` flips false — same mount/visible split
  // used by <Tooltip>/<DropdownMenu>.
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    // Portaling to <body> escapes any [data-theme] ancestor (e.g.
    // <Navigation>'s forced dark theme) — capture it here, from the
    // anchor's real position in the tree, and reapply it below.
    setTheme(anchorRef.current?.closest("[data-theme]")?.getAttribute("data-theme") ?? undefined);
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
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  function handleTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.target === panelRef.current && !open) setRendered(false);
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (closeOnOverlayClick && event.target === event.currentTarget) setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const overlayVariantClass = variant === "default" ? "ds-modal-overlay--default" : `ds-modal-overlay--drawer-${side}`;
  const panelVariantClass = variant === "default" ? "ds-modal--default" : clsx("ds-modal--drawer", `ds-modal--drawer-${side}`);

  return (
    <>
      {/* Not rendered visibly — just marks this component's real position in
          the tree so the effect above can read the ambient [data-theme]. */}
      <span ref={anchorRef} style={{ display: "none" }} aria-hidden />
      {rendered &&
        createPortal(
          <div
            className={clsx("ds-modal-overlay", overlayVariantClass, visible && "ds-modal-overlay--visible")}
            onClick={handleOverlayClick}
            data-theme={theme}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className={clsx("ds-modal", panelVariantClass, visible && "ds-modal--visible", className)}
              onKeyDown={handleKeyDown}
              onTransitionEnd={handleTransitionEnd}
              {...rest}
            >
              {children}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
