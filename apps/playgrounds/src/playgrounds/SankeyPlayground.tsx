import { useMemo } from "react";
import { useControls, folder, button } from "leva";
import { Button } from "@numosai/ui";
import { generateSankey, buildSankeySvg } from "../lib/sankey";

export function SankeyPlayground() {
  const [
    {
      branches,
      steps,
      splitProbability,
      seed,
      branch1,
      branch2,
      branch3,
      branch4,
      branch5,
      nodeWidth,
      nodePadding,
      flowOpacity,
      canvasWidth,
      canvasHeight,
      background,
      transparent,
    },
    set,
  ] = useControls("Sankey", () => ({
    branches: { label: "Branches", value: 3, min: 1, max: 5, step: 1 },
    steps: { label: "Steps", value: 3, min: 1, max: 6, step: 1 },
    splitProbability: { label: "Split probability", value: 0.6, min: 0, max: 1, step: 0.01 },
    seed: { label: "Seed", value: 42, step: 1 },
    Reseed: button(() => set({ seed: Math.floor(Math.random() * 9999) + 1 })),

    Colors: folder({
      branch1: { label: "Branch 1", value: "#3b82f6" },
      branch2: { label: "Branch 2", value: "#ef4444" },
      branch3: { label: "Branch 3", value: "#22c55e" },
      branch4: { label: "Branch 4", value: "#f59e0b" },
      branch5: { label: "Branch 5", value: "#a855f7" },
    }),

    Layout: folder({
      nodeWidth: { label: "Node width", value: 12, min: 4, max: 32, step: 1 },
      nodePadding: { label: "Node gap", value: 6, min: 0, max: 24, step: 1 },
      flowOpacity: { label: "Flow opacity", value: 0.75, min: 0.1, max: 1, step: 0.01 },
    }),

    Canvas: folder({
      canvasWidth: { label: "Width", value: 800, min: 400, max: 1600, step: 50 },
      canvasHeight: { label: "Height", value: 480, min: 200, max: 900, step: 20 },
      background: { label: "Background", value: "#001d3d" },
      transparent: { label: "Transparent", value: false },
    }),
  }));

  const colors = [branch1, branch2, branch3, branch4, branch5];

  const svgOutput = useMemo(() => {
    const data = generateSankey(branches, steps, splitProbability, seed);
    return buildSankeySvg(data, colors, {
      width: canvasWidth,
      height: canvasHeight,
      nodeWidth,
      nodePadding,
      flowOpacity,
      bgColor: background,
      transparent,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, steps, splitProbability, seed, branch1, branch2, branch3, branch4, branch5, nodeWidth, nodePadding, flowOpacity, canvasWidth, canvasHeight, background, transparent]);

  function downloadSvg() {
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sankey-${seed}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copySvg() {
    void navigator.clipboard.writeText(svgOutput);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <header>
        <h2 style={{ margin: 0 }}>Sankey Chart</h2>
        <p style={{ color: "var(--content-subtle)", margin: "var(--space-2) 0 0" }}>
          Flow diagrams with branching paths. Adjust branches, steps, and split probability.
        </p>
      </header>

      <div
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: transparent
            ? "repeating-conic-gradient(#80808020 0% 25%, transparent 0% 50%) 0 0 / 16px 16px"
            : background,
          minHeight: 200,
          padding: "var(--space-4)",
        }}
        dangerouslySetInnerHTML={{ __html: svgOutput }}
      />

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Button variant="primary" onClick={downloadSvg}>Download SVG</Button>
        <Button variant="secondary" onClick={copySvg}>Copy SVG markup</Button>
      </div>
    </div>
  );
}
