import { useState } from "react";
import { BlobPlayground } from "./playgrounds/BlobPlayground";
import { DitherPlayground } from "./playgrounds/DitherPlayground";
import { ParticlePlayground } from "./playgrounds/ParticlePlayground";
import { PolygonPlayground } from "./playgrounds/PolygonPlayground";
import { SankeyPlayground } from "./playgrounds/SankeyPlayground";
import { Button } from "@numosai/ui";

type PlaygroundId = "blob" | "dither" | "particles" | "polygon" | "sankey";

const PLAYGROUNDS: Array<{ id: PlaygroundId; label: string; description: string }> = [
  { id: "blob", label: "Blob", description: "Smooth, organic, parametric blob shapes." },
  { id: "dither", label: "Dither", description: "Convert SVG gradients and blurs into halftone dots." },
  { id: "particles", label: "Particles", description: "Animate an SVG as a looping particle assembly." },
  { id: "polygon", label: "Polygon", description: "Crystallize a sphere SVG into low-poly art." },
  { id: "sankey", label: "Sankey", description: "Flow diagrams with configurable branches and splits." },
];

export default function App() {
  const [active, setActive] = useState<PlaygroundId>("blob");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside
        style={{
          borderRight: "1px solid var(--border-base)",
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <h1 style={{ fontSize: "var(--text-l)", margin: 0 }}>Playgrounds</h1>
        <p style={{ color: "var(--content-subtle)", fontSize: "var(--text-sm)", margin: 0 }}>
          Tweak parameters, export SVG.
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          {PLAYGROUNDS.map((p) => (
            <Button
              key={p.id}
              variant={active === p.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActive(p.id)}
              fullWidth
            >
              {p.label}
            </Button>
          ))}
        </nav>
      </aside>
      <main style={{ padding: "var(--space-6)" }}>
        {active === "blob" && <BlobPlayground />}
        {active === "dither" && <DitherPlayground />}
        {active === "particles" && <ParticlePlayground />}
        {active === "polygon" && <PolygonPlayground />}
        {active === "sankey" && <SankeyPlayground />}
      </main>
    </div>
  );
}
