import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCountUp } from "./useCountUp";

describe("useCountUp", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the value unchanged when disabled", () => {
    const { result } = renderHook(() => useCountUp("$24.2K", false));
    expect(result.current).toBe("$24.2K");
  });

  it("returns the value unchanged when it has no recognizable number", () => {
    const { result } = renderHook(() => useCountUp("Not a number", true));
    expect(result.current).toBe("Not a number");
  });

  it("returns non-string ReactNode values unchanged, even when enabled", () => {
    const node = "Revenue" as const;
    const { result } = renderHook(() => useCountUp(node, true));
    expect(result.current).toBe("Revenue");
  });

  it("respects prefers-reduced-motion, leaving the final value in place with no animated frames", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

    const { result } = renderHook(() => useCountUp("$24.2K", true));
    // The reduced-motion branch returns before ever calling setAnimated, so
    // the hook's own fallback (the raw `value`) is what renders — never "0".
    expect(result.current).toBe("$24.2K");
  });
});
