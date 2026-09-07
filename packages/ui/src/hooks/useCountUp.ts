import { useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

interface ParsedNumeric {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  grouped: boolean;
}

/**
 * Pulls the first number out of a formatted string — e.g. `"-$3.1K"` →
 * `{ prefix: "-$", target: 3.1, suffix: "K", decimals: 1, grouped: false }`
 * — so the count-up animation can hold everything except the digits
 * themselves fixed (the `-`/`$`/`K` never move) while still landing on
 * whatever precision and thousands-grouping the caller's own formatter
 * (`Intl.NumberFormat`, `toFixed`, etc.) already produced. Returns `null` for
 * anything without a recognizable number, so non-numeric `value`s (or a
 * `ReactNode` that isn't a plain string at all) fall back to rendering as-is.
 */
function parseNumeric(raw: string): ParsedNumeric | null {
  const match = raw.match(/[\d,]*\.?\d+/);
  if (!match || match.index === undefined) return null;
  const numericText = match[0];
  const target = Number.parseFloat(numericText.replace(/,/g, ""));
  if (Number.isNaN(target)) return null;
  const decimalIndex = numericText.indexOf(".");
  return {
    prefix: raw.slice(0, match.index),
    suffix: raw.slice(match.index + numericText.length),
    target,
    decimals: decimalIndex === -1 ? 0 : numericText.length - decimalIndex - 1,
    grouped: numericText.includes(","),
  };
}

function formatNumeric(n: number, { decimals, grouped }: Pick<ParsedNumeric, "decimals" | "grouped">): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped });
}

// Longer than any `--motion-enter*` token — those are tuned for a shape or
// an opacity settling into place, not for a reader actually tracking digits
// as they climb, which needs more real time to stay legible.
const COUNT_UP_DURATION_MS = 1200;

/**
 * Animates `value` counting up from 0 (or down, for a negative number) to
 * its real value on mount, when `enabled` and `value` is a string containing
 * a recognizable number — otherwise `value` is returned unchanged, so it's
 * always safe to pass a non-numeric `ReactNode` with `enabled` on.
 *
 * The very first render always returns the final `value` as-is (safe for a
 * non-JS/pre-effect paint), then a `useLayoutEffect` — not `useEffect` —
 * swaps in the animated sequence *before* the browser paints, so the first
 * frame the user actually sees is "0" climbing up rather than a flash of the
 * final value followed by a reset back down to 0. It checks
 * `prefers-reduced-motion` itself, since a JS-driven `requestAnimationFrame`
 * loop (unlike a CSS `@keyframes` animation) isn't something a stylesheet's
 * own media query can gate — reduced-motion leaves the final value in place
 * with no animated frames at all.
 */
export function useCountUp(value: ReactNode, enabled: boolean): ReactNode {
  const parsed = enabled && typeof value === "string" ? parseNumeric(value) : null;
  const [animated, setAnimated] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / COUNT_UP_DURATION_MS);
      const eased = 1 - (1 - t) ** 3;
      setAnimated(`${parsed!.prefix}${formatNumeric(parsed!.target * eased, parsed!)}${parsed!.suffix}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    tick(start);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.target, parsed?.prefix, parsed?.suffix, parsed?.decimals, parsed?.grouped]);

  return animated ?? value;
}
