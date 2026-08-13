import { useEffect, useRef, useState } from "react";
import { useControls, button } from "leva";
import { Button } from "@numosai/ui";
import { polygonizeSvg, sampleSphereSvg } from "../lib/lowpoly";
import type { PolygonType } from "../lib/lowpoly";

export function PolygonPlayground() {
  const [sourceSvg, setSourceSvg] = useState<string | null>(null);
  const [sourceFilename, setSourceFilename] = useState("");
  const [outputSvg, setOutputSvg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [
    { polygonType, size, jitter, seed, strokeWidth, strokeColor, background, transparent },
    set,
  ] = useControls("Polygon", () => ({
    polygonType: {
      label: "Polygon type",
      value: "triangle",
      options: { Triangle: "triangle", Square: "square", Hexagon: "hexagon" },
    },
    size: { label: "Size", value: 20, min: 6, max: 80, step: 1 },
    jitter: { label: "Jitter", value: 0.4, min: 0, max: 1, step: 0.01 },
    seed: { label: "Seed", value: 42, step: 1 },
    Reseed: button(() => set({ seed: Math.floor(Math.random() * 9999) + 1 })),
    strokeWidth: { label: "Stroke width", value: 0, min: 0, max: 4, step: 0.5 },
    strokeColor: { label: "Stroke color", value: "#000000" },
    background: "#0b1220",
    transparent: false,
  }));

  useEffect(() => {
    if (!sourceSvg) return;
    let active = true;
    setProcessing(true);
    setError(null);
    polygonizeSvg(sourceSvg, {
      polygonType: polygonType as PolygonType,
      size,
      jitter,
      seed,
      strokeColor,
      strokeWidth,
      background,
      transparent,
    })
      .then((result) => {
        if (active) {
          setOutputSvg(result);
          setProcessing(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Processing failed");
          setProcessing(false);
        }
      });
    return () => {
      active = false;
    };
  }, [sourceSvg, polygonType, size, jitter, seed, strokeColor, strokeWidth, background, transparent]);

  function loadFile(file: File) {
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
      setError("Please upload an SVG file.");
      return;
    }
    setError(null);
    setSourceFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setSourceSvg(e.target?.result as string);
    reader.readAsText(file);
  }

  function loadSample() {
    setError(null);
    setSourceFilename("sample-sphere.svg");
    setSourceSvg(sampleSphereSvg());
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  function downloadSvg() {
    if (!outputSvg) return;
    const b = new Blob([outputSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lowpoly-${polygonType}-${size}px.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copySvg() {
    if (outputSvg) void navigator.clipboard.writeText(outputSvg);
  }

  const previewBg = "color-mix(in oklch, var(--content-base) 4%, var(--background-default))";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <header>
        <h2 style={{ margin: 0 }}>Polygon</h2>
        <p style={{ color: "var(--content-subtle)", margin: "var(--space-2) 0 0" }}>
          Upload a sphere SVG (a circle with a radial gradient fill) and crystallize it into
          low-poly art. Adjust polygon type, size, and jitter with the knobs (top-right).
        </p>
      </header>

      {!sourceSvg ? (
        <div
          role="button"
          tabIndex={0}
          style={{
            display: "grid",
            placeItems: "center",
            minHeight: 360,
            padding: "var(--space-6)",
            borderRadius: "var(--radius-lg)",
            background: previewBg,
            border: "2px dashed var(--border-base)",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "var(--text-l)", pointerEvents: "none" }}>Drop a sphere SVG here</p>
            <p
              style={{
                margin: "var(--space-2) 0 0",
                color: "var(--content-subtle)",
                fontSize: "var(--text-sm)",
                pointerEvents: "none",
              }}
            >
              or click to browse
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                loadSample();
              }}
              style={{ marginTop: "var(--space-4)" }}
            >
              Load sample sphere
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <>
          <div
            style={{
              position: "relative",
              display: "grid",
              placeItems: "center",
              minHeight: 360,
              padding: "var(--space-6)",
              borderRadius: "var(--radius-lg)",
              background: previewBg,
              overflow: "hidden",
            }}
          >
            {processing && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  background: "color-mix(in oklch, var(--background-default) 75%, transparent)",
                  borderRadius: "var(--radius-lg)",
                  zIndex: 1,
                }}
              >
                <p style={{ color: "var(--content-subtle)", margin: 0 }}>Processing…</p>
              </div>
            )}
            {outputSvg && (
              <div
                dangerouslySetInnerHTML={{ __html: outputSvg }}
                style={{ maxWidth: "100%", maxHeight: 480, lineHeight: 0 }}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="primary" onClick={downloadSvg} disabled={!outputSvg || processing}>
              Download SVG
            </Button>
            <Button variant="secondary" onClick={copySvg} disabled={!outputSvg || processing}>
              Copy SVG markup
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSourceSvg(null);
                setOutputSvg(null);
                setSourceFilename("");
                setError(null);
              }}
            >
              Upload new
            </Button>
            {sourceFilename && (
              <span style={{ color: "var(--content-subtle)", fontSize: "var(--text-sm)" }}>{sourceFilename}</span>
            )}
          </div>
        </>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--content-negative)" }}>{error}</p>
      )}
    </div>
  );
}
