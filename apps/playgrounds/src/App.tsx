import { useState } from "react";
import { BlobPlayground } from "./playgrounds/BlobPlayground";
import { Button } from "@numosai/ui";

type PlaygroundId = "blob";

const PLAYGROUNDS: Array<{ id: PlaygroundId; label: string; description: string }> = [
  { id: "blob", label: "Blob", description: "Smooth, organic, parametric blob shapes." },
];

export default function App() {
  const [active, setActive] = useState<PlaygroundId>("blob");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside
        style={{
          borderRight: "1px solid var(--color-border)",
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <h1 style={{ fontSize: "var(--text-xl)", margin: 0 }}>Playgrounds</h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Tweak parameters, export SVG.
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          {PLAYGROUNDS.map((p) => (
            <Button
              key={p.id}
              variant={active === p.id ? "primary" : "ghost"}
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
      </main>
    </div>
  );
}
