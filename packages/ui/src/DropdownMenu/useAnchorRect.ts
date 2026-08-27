import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

interface Anchor {
  rect: DOMRect;
  /** The trigger's nearest `[data-theme]` ancestor, if any — reapplied to the portaled panel since portaling to `<body>` would otherwise escape it (e.g. a `<Modal>`'s own forced theme). */
  theme: string | null;
}

function rectsEqual(a: DOMRect, b: DOMRect): boolean {
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

/**
 * Measures a trigger element's viewport position/size while `active` — the
 * same anchor-tracking `<Tooltip>` uses for its own portal, shared here
 * since `<DropdownMenuContent>`/`<DropdownMenuPanel>` need identical
 * behavior: portaling to `document.body` escapes any clipping/scrolling
 * ancestor (e.g. a `<Modal>`'s own `overflow: hidden` panel, which would
 * otherwise crop the dropdown the instant it extends past the modal's own
 * box), so position has to be computed from the real trigger rect instead
 * of plain CSS `position: absolute` in place.
 *
 * `active` should track the panel's *mounted* lifetime (including its close
 * transition), not just its open/closed visibility — otherwise the anchor
 * goes stale the moment `open` flips false, and the panel jumps mid-exit.
 */
export function useAnchorRect(triggerRef: RefObject<HTMLElement>, active: boolean): Anchor | null {
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  function measure(): Anchor | null {
    const el = triggerRef.current;
    if (!el) return null;
    const theme = el.closest("[data-theme]")?.getAttribute("data-theme") ?? null;
    return { rect: el.getBoundingClientRect(), theme };
  }

  function apply(next: Anchor | null) {
    if (!next) return;
    setAnchor((prev) => (prev && prev.theme === next.theme && rectsEqual(prev.rect, next.rect) ? prev : next));
  }

  // Re-measures after every render (no dependency array) while active, not
  // just on mount — the trigger can move without `active` itself changing.
  useLayoutEffect(() => {
    if (!active) return;
    apply(measure());
  });

  useLayoutEffect(() => {
    if (!active) return;
    function handle() {
      apply(measure());
    }
    // The trigger can also move for reasons outside the render cycle — a
    // scroll on any ancestor (capture: true catches those, since scroll
    // doesn't bubble) or a viewport resize.
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [active]);

  return active ? anchor : null;
}
