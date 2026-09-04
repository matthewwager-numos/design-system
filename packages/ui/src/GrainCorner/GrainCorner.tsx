import type { CSSProperties } from "react";
import { clsx } from "clsx";
import "./GrainCorner.css";

export interface GrainCornerProps {
  /** Any real CSS color (a token reference like `"var(--background-positive-base)"`, or a literal color) — tints both the underlying glow and the grain blended over it. */
  color: string;
  className?: string;
}

/**
 * A dithered, corner-anchored glow — `color` fading in from one corner,
 * textured with a grainy dithered gradient rather than a flat, banded one.
 * Reused across the design system wherever that specific effect is called
 * for (currently `<DisplayMetric>`'s own corner ornament).
 *
 * The technique (per https://css-tricks.com/grainy-gradients/, tuned
 * against a real Figma export rather than guessed): a same-document SVG
 * `feTurbulence` filter, desaturated to grayscale (`feColorMatrix
 * type="saturate" values="0"` — raw turbulence has independently-random
 * R/G/B channels, which reads as rainbow static otherwise) and used as a
 * plain `background-image`, then punched up with a *CSS* `contrast()`/
 * `brightness()` filter and combined with a color layer via
 * `mix-blend-mode: soft-light`. A `mask-image` (radial, anchored to the
 * same corner) fades the whole thing out toward the opposite corner.
 *
 * Three real, non-obvious constraints the markup below depends on —
 * confirmed the hard way against real (Chromium) rendering, not assumed:
 * - Referencing the SVG filter from CSS `filter: url("data:...")` directly
 *   silently no-ops in Chromium. The turbulence filter has to be applied
 *   *inside* its own self-contained SVG document (to a `<rect>`, via a
 *   same-document `#id`), with that whole SVG used as a plain
 *   `background-image` — only the contrast/brightness *functions* (no
 *   `url()`) belong in the actual CSS `filter` property.
 * - The `mask-image` has to wrap the *whole* isolated color+grain group
 *   (`.ds-grain-corner`, one element out), not sit on a wrapper between the
 *   isolation boundary and the grain layer itself — that placement
 *   silently produced a masked-but-untextured (flat) result.
 * - The grain layer must not have its own `background-color` fallback
 *   sitting underneath the `background-image` — even fully overridden by a
 *   more specific `background-image` declaration, its mere presence in the
 *   cascade silently broke `mix-blend-mode` compositing for this element.
 */
export function GrainCorner({ color, className }: GrainCornerProps) {
  return (
    <div className={clsx("ds-grain-corner", className)} style={{ "--ds-grain-corner-color": color } as CSSProperties}>
      <div className="ds-grain-corner__group">
        <div className="ds-grain-corner__color" />
        <div className="ds-grain-corner__grain" />
      </div>
    </div>
  );
}
