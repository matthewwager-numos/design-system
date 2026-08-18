import { useCallback, useLayoutEffect, useState } from "react";

/**
 * Measures the returned ref's real rendered height and keeps a CSS custom
 * property in sync with it (via ResizeObserver) — for fixed-position chrome
 * that other elements need to offset by, where hand-typing an assumed
 * height in CSS has already proven unreliable in practice (confirmed on
 * `<MobileAppHeader>`: it renders taller than its padding + content alone
 * would suggest). `useLayoutEffect`, not `useEffect`, so the variable is
 * corrected before the browser paints rather than one frame late.
 *
 * `target` defaults to `document.documentElement` (for chrome shared across
 * an app, like a fixed mobile nav bar) — pass a specific element (e.g. a
 * component's own root ref) to scope the variable locally instead, as
 * `<Wizard>` does for its own fixed footer.
 *
 * A callback ref backed by state, not a plain `useRef`: if the element this
 * is attached to unmounts and later remounts *within the same component
 * instance* (e.g. a parent conditionally swapping this subtree out and
 * back in), a plain ref's one-time effect never re-attaches to the new
 * node — and the *old* ResizeObserver's final callback, firing as its node
 * is removed from the document, reports a height of 0, which then sticks
 * permanently. Using state for the element means React re-runs this effect
 * on every real attach/detach, so a remount is re-measured instead of stuck
 * at a stale (or zeroed) value.
 */
export function useMeasuredHeightVar<T extends HTMLElement>(cssVarName: string, target: HTMLElement | (() => HTMLElement) = document.documentElement) {
  const [element, setElement] = useState<T | null>(null);
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useLayoutEffect(() => {
    if (!element) return;
    const targetEl = typeof target === "function" ? target() : target;

    function setVar() {
      targetEl.style.setProperty(cssVarName, `${element!.getBoundingClientRect().height}px`);
    }

    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, cssVarName]);

  return ref;
}
