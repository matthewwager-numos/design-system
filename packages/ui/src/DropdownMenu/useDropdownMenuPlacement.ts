import { useLayoutEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import type { DropdownMenuPlacement } from "./DropdownMenu";

interface Anchor {
  rect: DOMRect;
  theme: string | null;
}

// Real pixel values for the viewport-collision math below — the rendered
// CSS still goes through the design token (var(--space-1)) via the calc()
// strings in verticalStyle/horizontalStyle; these two are only for the
// yes/no "does it fit" decision, not anything actually drawn.
const GAP = 4;
const EDGE_PADDING = 8;

function verticalStyle(placement: DropdownMenuPlacement, rect: DOMRect): CSSProperties {
  return placement === "bottom"
    ? { top: `calc(${rect.bottom}px + var(--space-1))` }
    : { bottom: `calc(${window.innerHeight - rect.top}px + var(--space-1))` };
}

function horizontalStyle(align: "left" | "right", rect: DOMRect): CSSProperties {
  return align === "left" ? { left: `${rect.left}px` } : { right: `${window.innerWidth - rect.right}px` };
}

interface Resolved {
  placement: DropdownMenuPlacement;
  align: "left" | "right";
}

export interface DropdownMenuPlacementResult {
  placement: DropdownMenuPlacement;
  align: "left" | "right";
  style: CSSProperties;
}

/**
 * Positions a portaled panel from the trigger's own measured rect
 * (`anchor`), then — once the panel itself has real dimensions to measure
 * — corrects for viewport collisions: flips to the opposite vertical side
 * when the preferred one would run the panel off the top/bottom of the
 * screen, and right-aligns instead of left-aligning when it would run off
 * the right edge. An icon button pinned near a corner of the viewport (a
 * table row's kebab menu, say) ends up opening whichever combination of
 * above/below and left/right keeps the whole panel on-screen, rather than
 * a fixed side that can clip.
 *
 * The correction runs inside a `useLayoutEffect` — synchronous, before the
 * browser paints — so it converges (at most one extra render) within the
 * panel's own "just mounted, not yet visible" window (see the double-rAF
 * enter-transition timing in `DropdownMenuContent`/`DropdownMenuPanel`):
 * only the final, already-correct position is ever actually seen.
 */
export function useDropdownMenuPlacement(
  panelRef: RefObject<HTMLElement>,
  anchor: Anchor | null,
  preferredPlacement: DropdownMenuPlacement,
  matchTriggerWidth: boolean,
): DropdownMenuPlacementResult | null {
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return;
    const panelRect = panelRef.current?.getBoundingClientRect();
    if (!panelRect) return;

    let placement = preferredPlacement;
    const spaceBelow = window.innerHeight - anchor.rect.bottom - GAP;
    const spaceAbove = anchor.rect.top - GAP;
    if (placement === "bottom" && panelRect.height > spaceBelow && panelRect.height <= spaceAbove) placement = "top";
    else if (placement === "top" && panelRect.height > spaceAbove && panelRect.height <= spaceBelow) placement = "bottom";

    const spaceRight = window.innerWidth - anchor.rect.left - EDGE_PADDING;
    const align: "left" | "right" = panelRect.width > spaceRight ? "right" : "left";

    setResolved((prev) => (prev && prev.placement === placement && prev.align === align ? prev : { placement, align }));
  });

  if (!anchor) return null;
  const placement = resolved?.placement ?? preferredPlacement;
  const align = resolved?.align ?? "left";
  return {
    placement,
    align,
    style: {
      ...verticalStyle(placement, anchor.rect),
      ...horizontalStyle(align, anchor.rect),
      transformOrigin: `${placement === "bottom" ? "top" : "bottom"} ${align}`,
      ...(matchTriggerWidth ? { minWidth: `${anchor.rect.width}px` } : {}),
    },
  };
}
