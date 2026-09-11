import { describe, expect, it } from "vitest";
import { chartColor, chartColorMuted } from "./chartColors";

describe("chartColor", () => {
  it("picks the palette color at the given index", () => {
    expect(chartColor(0)).toBe("var(--chart-1)");
    expect(chartColor(4)).toBe("var(--chart-5)");
  });

  it("wraps around the 5-color palette instead of running out", () => {
    expect(chartColor(5)).toBe(chartColor(0));
    expect(chartColor(7)).toBe(chartColor(2));
  });
});

describe("chartColorMuted", () => {
  it("mixes the given color to 50% against transparent", () => {
    expect(chartColorMuted("var(--chart-2)")).toBe("color-mix(in srgb, var(--chart-2) 50%, transparent)");
  });

  it("works on any color string, not just chart tokens", () => {
    expect(chartColorMuted("#ff0000")).toBe("color-mix(in srgb, #ff0000 50%, transparent)");
  });
});
