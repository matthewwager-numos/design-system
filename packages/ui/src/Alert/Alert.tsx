import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { Banner } from "../Banner";
import type { BannerStatus } from "../Banner";
import "./Alert.css";

export type AlertStatus = BannerStatus;

export type AlertPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface AlertProps {
  status?: AlertStatus;
  title: ReactNode;
  description?: ReactNode;
  /**
   * Which screen edge to float the alert from. Slide direction follows the
   * vertical half — top positions slide down into view, bottom positions
   * slide up — regardless of horizontal alignment.
   */
  position?: AlertPosition;
  /** Auto-dismiss after this many ms. Omit to require manual dismissal. */
  autoDismissDelay?: number;
  /** Called once the dismiss transition finishes — remove the Alert from your tree here. */
  onDismiss?: () => void;
  /** Show the close (×) button. Defaults to true. */
  dismissible?: boolean;
  className?: string;
}

// Alerts floated to the same position share one viewport element so they
// stack instead of overlapping — each Alert instance doesn't know about
// its siblings, only about the shared DOM node for its position.
const viewports = new Map<AlertPosition, HTMLDivElement>();

function acquireViewport(position: AlertPosition): HTMLDivElement {
  const existing = viewports.get(position);
  if (existing && document.body.contains(existing)) return existing;
  const el = document.createElement("div");
  el.className = clsx("ds-alert-viewport", `ds-alert-viewport--${position}`);
  document.body.appendChild(el);
  viewports.set(position, el);
  return el;
}

function releaseViewport(position: AlertPosition) {
  const el = viewports.get(position);
  if (el && el.childElementCount === 0) {
    el.remove();
    viewports.delete(position);
  }
}

/**
 * A toast/snackbar — a status notification that floats over the page and
 * dismisses itself (manually or after `autoDismissDelay`). Renders the same
 * <Banner> card, portaled to a screen edge with position-aware slide
 * transition. For the plain in-page version, use <Banner> directly.
 */
export function Alert({
  status = "neutral",
  title,
  description,
  position = "bottom-center",
  autoDismissDelay,
  onDismiss,
  dismissible = true,
  className,
}: AlertProps) {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dismissingRef = useRef(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!autoDismissDelay) return;
    const timer = setTimeout(dismiss, autoDismissDelay);
    return () => clearTimeout(timer);
  }, [autoDismissDelay, dismiss]);

  useEffect(() => {
    // acquireViewport (called during render, below, so createPortal has a
    // container synchronously) creates the shared node; this only owns
    // releasing it once the last Alert at this position unmounts.
    return () => releaseViewport(position);
  }, [position]);

  function handleTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.target === cardRef.current && dismissingRef.current) {
      onDismiss?.();
    }
  }

  const card = (
    <Banner
      ref={cardRef}
      status={status}
      title={title}
      description={description}
      dismissible={dismissible}
      onDismiss={dismiss}
      className={clsx(
        "ds-alert",
        position.startsWith("top") ? "ds-alert--top" : "ds-alert--bottom",
        visible && "ds-alert--visible",
        className,
      )}
      onTransitionEnd={handleTransitionEnd}
    />
  );

  return createPortal(card, acquireViewport(position));
}
