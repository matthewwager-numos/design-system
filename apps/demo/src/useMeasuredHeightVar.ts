import { useLayoutEffect, useRef } from "react";

/**
 * Measures the returned ref's real rendered height and keeps a CSS custom
 * property on the document root in sync with it (via ResizeObserver) —
 * for fixed-position mobile chrome (MobileNav/MobileAppHeader) that other
 * elements need to offset by, where hand-typing an assumed height in CSS
 * has already proven unreliable (confirmed: MobileAppHeader renders at
 * 75px, not the ~40px its padding + content alone would suggest).
 * `useLayoutEffect`, not `useEffect`, so the variable is corrected before
 * the browser paints rather than one frame late.
 */
export function useMeasuredHeightVar<T extends HTMLElement>(cssVarName: string) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    function setVar() {
      document.documentElement.style.setProperty(cssVarName, `${el!.getBoundingClientRect().height}px`);
    }

    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [cssVarName]);

  return ref;
}
