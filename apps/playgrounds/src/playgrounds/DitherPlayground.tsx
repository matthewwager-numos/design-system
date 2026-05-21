import { useEffect, useRef, useState } from "react";
import { useControls } from "leva";
import { Button } from "@numosai/ui";
import { ditherSvg } from "../lib/dither";
import type { DotShape } from "../lib/dither";

export function DitherPlayground() {
  const [sourceSvg, setSourceSvg] = useState<string | null>(null);
  const [sourceFilename, setSourceFilename] = useState("");
  const [ditheredSvg, setDitheredSvg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { cellSize, dotScale, shape, angle, fg, bg, invert } = useControls("Dither", {
    cellSize: { value: 8, min: 2, max: 40, step: 1, label: "Cell size" },
    dotScale: { value: 0.9, min: 0.1, max: 1.2, step: 0.05, label: "Dot scale" },
    shape: {
      value: "circle",
      options: { Circle: "circle", Square: "square", Diamond: "diamond" },
    },
    angle: { value: 0, min: 0, max: 90, step: 1, label: "Angle °" },
    fg: "#000000",
    bg: "#ffffff",
    invert: false,
  });

  useEffect(() => {
    if (!sourceSvg) return;
    let active = true;
    setProcessing(true);
    setError(null);
    ditherSvg(sourceSvg, {
      cellSize,
      dotScale,
      shape: shape as DotShape,
      angle,
      fg,
      bg,
      invert,
    })
      .then((result) => {
        if (active) {
          setDitheredSvg(result);
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
  }, [sourceSvg, cellSize, dotScale, shape, angle, fg, bg, invert]);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    // Reset so the same file can be re-selected after "Upload new"
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  function downloadSvg() {
    if (!ditheredSvg) return;
    const b = new Blob([ditheredSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dithered-${shape}-${cellSize}px.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copySvg() {
    if (ditheredSvg) void navigator.clipboard.writeText(ditheredSvg);
  }

  const previewBg = "color-mix(in oklch, var(--color-fg) 4%, var(--color-bg))";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <header>
        <h2 style={{ margin: 0 }}>Dither</h2>
        <p style={{ color: "var(--color-muted)", margin: "var(--space-2) 0 0" }}>
          Upload an SVG — gradients and blurs are re-rendered as halftone dots. Adjust
          cell size, shape, and angle with the knobs (top-right).
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
            border: "2px dashed var(--color-border)",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <div style={{ textAlign: "center", pointerEvents: "none" }}>
            <p style={{ margin: 0, fontSize: "var(--text-lg)" }}>Drop an SVG here</p>
            <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-muted)", fontSize: "var(--text-sm)" }}>
              or click to browse
            </p>
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
                  background: "color-mix(in oklch, var(--color-bg) 75%, transparent)",
                  borderRadius: "var(--radius-lg)",
                  zIndex: 1,
                }}
              >
                <p style={{ color: "var(--color-muted)", margin: 0 }}>Processing…</p>
              </div>
            )}
            {ditheredSvg && (
              <div
                dangerouslySetInnerHTML={{ __html: ditheredSvg }}
                style={{ maxWidth: "100%", maxHeight: 480, lineHeight: 0 }}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="primary" onClick={downloadSvg} disabled={!ditheredSvg || processing}>
              Download SVG
            </Button>
            <Button variant="secondary" onClick={copySvg} disabled={!ditheredSvg || processing}>
              Copy SVG markup
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSourceSvg(null);
                setDitheredSvg(null);
                setSourceFilename("");
                setError(null);
              }}
            >
              Upload new
            </Button>
            {sourceFilename && (
              <span style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)" }}>
                {sourceFilename}
              </span>
            )}
          </div>
        </>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-danger, #e53e3e)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
