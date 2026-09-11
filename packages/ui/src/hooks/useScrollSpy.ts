import { useEffect, useState } from "react";
import type { RefObject } from "react";

/**
 * Tracks which of a page's own sections is currently scrolled into view,
 * for a scroll-spy nav (a strip of anchors where the "active" one tracks
 * scroll position, rather than switching which content is visible the way
 * `<Tabs>` does — this is for one continuously-scrolling column of
 * sections, not tab panels). `sectionIds` are real element ids (via
 * `document.getElementById`, not refs) since the sections themselves are
 * typically rendered by the caller's own JSX, not passed in as elements.
 *
 * `containerRef` should point at the actual scrolling ancestor (e.g.
 * `<ModalBody>`'s own root, which forwards its ref for exactly this) — an
 * `IntersectionObserver` rooted at the viewport (`root: null`) would
 * misfire for a scrollable region that isn't the whole page, like a drawer.
 *
 * The "active" section is the first (in `sectionIds` order) whose
 * intersection currently counts as active under a top-biased
 * `rootMargin` — a section counts once its top has crossed into the top
 * ~15% of the container, not merely once any pixel of it is visible,
 * which is what keeps a short section near the bottom of the list from
 * "activating" the moment its very top edge peeks into view.
 */
export function useScrollSpy(sectionIds: string[], containerRef: RefObject<HTMLElement | null>): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const key = sectionIds.join("|");

  useEffect(() => {
    const root = containerRef.current;
    const ids = key ? key.split("|") : [];
    if (!root || ids.length === 0) return;

    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const next = ids.find((id) => visible.has(id));
        if (next) setActiveId(next);
      },
      { root, rootMargin: "0px 0px -85% 0px", threshold: 0 },
    );

    setActiveId(ids[0] ?? null);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key, containerRef]);

  return activeId;
}
