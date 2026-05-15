import { useMemo } from "react";
import { useControls, button } from "leva";
import { blob } from "@numosai/generative";
import { Button } from "@numosai/ui";

export function BlobPlayground() {
  const { points, randomness, radius, seed, fill } = useControls("Blob", {
    points: { value: 6, min: 3, max: 20, step: 1 },
    randomness: { value: 0.35, min: 0, max: 1, step: 0.01 },
    radius: { value: 140, min: 40, max: 300, step: 10 },
    seed: { value: 42, step: 1 },
    fill: "var(--color-primary)",
    Reseed: button(() => {
      // Leva's button can't easily mutate other controls without state; just hint at it.
      window.dispatchEvent(new CustomEvent("blob-reseed"));
    }),
  });

  const { d, viewBox } = useMemo(
    () => blob({ points, randomness, radius, seed }),
    [points, randomness, radius, seed],
  );

  const svgString = useMemo(
    () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path d="${d}" fill="${fill}"/></svg>`,
    [d, viewBox, fill],
  );

  function downloadSvg() {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blob-${seed}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copySvg() {
    void navigator.clipboard.writeText(svgString);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <header>
        <h2 style={{ margin: 0 }}>Blob</h2>
        <p style={{ color: "var(--color-muted)", margin: "var(--space-2) 0 0" }}>
          Parametric organic shapes. Adjust the knobs (top-right) and export.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          placeItems: "center",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-lg)",
          background: "color-mix(in oklch, var(--color-fg) 4%, var(--color-bg))",
          minHeight: 360,
        }}
      >
        <svg viewBox={viewBox} width={2 * radius} height={2 * radius}>
          <path d={d} fill={fill} />
        </svg>
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Button variant="primary" onClick={downloadSvg}>Download SVG</Button>
        <Button variant="secondary" onClick={copySvg}>Copy SVG markup</Button>
      </div>
    </div>
  );
}
