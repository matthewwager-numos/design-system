export interface RecolorOptions {
  /**
   * Map of "from color" → "to color". Both sides are matched as-is, so use
   * the exact string as it appears in the SVG (`#FF0000`, `rgb(...)`,
   * `var(--color-primary)`, etc.). Case-insensitive for hex codes.
   */
  map: Record<string, string>;
}

/**
 * Find-and-replace colors inside an SVG string.
 *
 *   recolor(svg, { map: { "#FF0000": "var(--color-primary)" } })
 *
 * Naive on purpose — operates on the raw text. For real production use you
 * may want to swap in `svgo` or DOM parsing, but for quick illustration
 * retints this is fast and predictable.
 */
export function recolor(svg: string, opts: RecolorOptions): string {
  let out = svg;
  for (const [from, to] of Object.entries(opts.map)) {
    // Match case-insensitively for hex codes; exact for everything else.
    const isHex = /^#[0-9a-f]{3,8}$/i.test(from);
    const pattern = isHex
      ? new RegExp(escapeRegex(from), "gi")
      : new RegExp(escapeRegex(from), "g");
    out = out.replace(pattern, to);
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
