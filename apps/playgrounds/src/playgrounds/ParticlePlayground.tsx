import { useEffect, useRef, useState } from "react";
import { useControls, folder } from "leva";
import { Button } from "@numosai/ui";
import { samplePoints, buildAnimatedSvg, sanitizeSvg } from "../lib/particles";
import type {
  ParticleShape, ColorMode, ExplodeMode, AssembleBias, EasingMode, SamplingMode,
} from "../lib/particles";

export function ParticlePlayground() {
  const [sourceSvg, setSourceSvg] = useState<string | null>(null);
  const [sourceSvg2, setSourceSvg2] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [filename2, setFilename2] = useState("");
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("Upload an SVG to get started.");
  const previewRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  const {
    particleCount, particleSize, shape, particleColor, colorMode,
    duration, scatter, explodeMode, assembleBias, jitter, hold, stagger, easing,
    canvasWidth, canvasHeight, logoScale, renderScale, backgroundColor, transparentBg,
    seed, samplingMode, multiMode,
  } = useControls({
    Particles: folder({
      particleCount: { value: 650, min: 50, max: 2500, step: 1 },
      particleSize: { value: 4, min: 1, max: 14, step: 0.5 },
      shape: { value: "circle", options: { Circle: "circle", Square: "square", Mixed: "mixed" } },
      particleColor: "#7abfff",
      colorMode: { value: "single", options: { "Single color": "single", "Sample logo": "sample", Rainbow: "rainbow" } },
    }),
    Motion: folder({
      duration: { value: 4, min: 1, max: 12, step: 0.5 },
      scatter: { value: 420, min: 50, max: 900, step: 10 },
      explodeMode: { value: "radial", options: { "Radial from center": "radial", Directional: "directional", "Noise field": "noise", Up: "up", Down: "down" } },
      assembleBias: { value: "random", options: { Random: "random", "Center first": "center", "Edges first": "edges", "Left to right": "left", "Top to bottom": "top" } },
      jitter: { value: 24, min: 0, max: 120, step: 1 },
      hold: { value: 18, min: 0, max: 50, step: 1, label: "Logo hold %" },
      stagger: { value: 28, min: 0, max: 80, step: 1, label: "Stagger %" },
      easing: { value: "ease", options: { "Ease in/out": "ease", Linear: "linear", Snappy: "snap" } },
    }),
    Canvas: folder({
      canvasWidth: { value: 900, step: 10, label: "Width" },
      canvasHeight: { value: 520, step: 10, label: "Height" },
      logoScale: { value: 55, min: 10, max: 95, step: 1, label: "Logo scale %" },
      renderScale: { value: 100, min: 25, max: 200, step: 5, label: "Render scale %" },
      backgroundColor: "#071827",
      transparentBg: { value: false, label: "Transparent bg" },
    }),
    Sampling: folder({
      seed: { value: 18429, step: 1 },
      samplingMode: { value: "fill", options: { "Fill area": "fill", "Path outline": "outline" } },
      multiMode: { value: false, label: "Multi-shape (A→B)" },
    }),
  });

  // Inject generated SVG directly into DOM so SMIL animations run
  useEffect(() => {
    if (!previewRef.current || !svgOutput) return;
    previewRef.current.innerHTML = svgOutput;
    const svg = previewRef.current.querySelector("svg") as SVGSVGElement | null;
    if (svg && isPausedRef.current) svg.pauseAnimations?.();
  }, [svgOutput]);

  useEffect(() => {
    if (!sourceSvg) return;
    let active = true;
    // Capture current values so the async closure sees a consistent snapshot
    const svgA = sourceSvg;
    const svgB = multiMode && sourceSvg2 ? sourceSvg2 : undefined;

    const opts = {
      particleCount, particleSize,
      shape: shape as ParticleShape,
      particleColor, colorMode: colorMode as ColorMode,
      duration, scatter, explodeMode: explodeMode as ExplodeMode,
      assembleBias: assembleBias as AssembleBias,
      jitter, hold, stagger, easing: easing as EasingMode,
      canvasWidth, canvasHeight, logoScale, renderScale,
      backgroundColor, transparentBg,
      samplingMode: samplingMode as SamplingMode,
      seed,
    };

    const id = setTimeout(async () => {
      if (!active) return;
      setProcessing(true);
      setStatus("Sampling shape…");
      try {
        const pts = await samplePoints(sourceSvg, opts);
        if (!active) return;

        let ptsB = null;
        if (multiMode && sourceSvg2) {
          setStatus("Sampling second shape…");
          ptsB = await samplePoints(sourceSvg2, opts);
          if (!active) return;
        }

        setStatus("Building animation…");
        const svg = buildAnimatedSvg(pts, opts, ptsB, svgA, svgB);
        if (!active) return;
        setSvgOutput(svg);
        setStatus(`${pts.length} particles · ${(opts.canvasWidth)}×${opts.canvasHeight}px · ${opts.duration}s loop`);
      } catch (err) {
        if (active) setStatus("Error: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        if (active) setProcessing(false);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [
    sourceSvg, sourceSvg2, multiMode,
    particleCount, particleSize, shape, particleColor, colorMode,
    duration, scatter, explodeMode, assembleBias, jitter, hold, stagger, easing,
    canvasWidth, canvasHeight, logoScale, renderScale, backgroundColor, transparentBg,
    seed, samplingMode,
  ]);

  function loadSvg(file: File, setPrimary: boolean) {
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
      setStatus("Please upload an SVG file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = sanitizeSvg(e.target?.result as string);
      if (setPrimary) { setSourceSvg(text); setFilename(file.name); }
      else { setSourceSvg2(text); setFilename2(file.name); }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent, setPrimary: boolean) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadSvg(file, setPrimary);
  }

  function togglePause() {
    const svg = previewRef.current?.querySelector("svg") as SVGSVGElement | null;
    const next = !isPausedRef.current;
    isPausedRef.current = next;
    setPaused(next);
    if (svg) { if (next) svg.pauseAnimations?.(); else svg.unpauseAnimations?.(); }
  }

  function download() {
    if (!svgOutput) return;
    const b = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url; a.download = "particles.svg"; a.click();
    URL.revokeObjectURL(url);
  }

  function copy() {
    if (svgOutput) void navigator.clipboard.writeText(svgOutput);
  }

  const dropZoneBase: React.CSSProperties = {
    display: "grid", placeItems: "center", borderRadius: "var(--radius-lg)",
    border: "2px dashed var(--border-base)", cursor: "pointer",
  };

  const previewBg = "color-mix(in oklch, var(--content-base) 4%, var(--background-default))";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <header>
        <h2 style={{ margin: 0 }}>Particles</h2>
        <p style={{ color: "var(--content-subtle)", margin: "var(--space-2) 0 0" }}>
          Upload an SVG — its shape is sampled into particles that scatter and reassemble in a looping SMIL animation.
          Adjust count, motion, and colors with the knobs (top-right).
        </p>
      </header>

      {/* Upload area */}
      <div style={{ display: "grid", gridTemplateColumns: multiMode && sourceSvg ? "1fr 1fr" : "1fr", gap: "var(--space-3)" }}>
        {/* Primary SVG */}
        <div
          role="button" tabIndex={0}
          style={{ ...dropZoneBase, padding: "var(--space-4)", minHeight: 80, background: previewBg, position: "relative" }}
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => handleDrop(e, true)}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        >
          <span style={{ color: "var(--content-subtle)", fontSize: "var(--text-sm)", pointerEvents: "none" }}>
            {filename || "Drop or click to upload SVG (A)"}
          </span>
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadSvg(f, true); e.target.value = ""; }} />
        </div>

        {/* Secondary SVG — only shown when multiMode is on */}
        {multiMode && sourceSvg && (
          <div
            role="button" tabIndex={0}
            style={{ ...dropZoneBase, padding: "var(--space-4)", minHeight: 80, background: previewBg }}
            onClick={() => fileRef2.current?.click()}
            onDrop={(e) => handleDrop(e, false)}
            onDragOver={(e) => e.preventDefault()}
            onKeyDown={(e) => e.key === "Enter" && fileRef2.current?.click()}
          >
            <span style={{ color: "var(--content-subtle)", fontSize: "var(--text-sm)", pointerEvents: "none" }}>
              {filename2 || "Drop or click to upload SVG (B)"}
            </span>
            <input ref={fileRef2} type="file" accept=".svg,image/svg+xml" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadSvg(f, false); e.target.value = ""; }} />
          </div>
        )}
      </div>

      {/* Preview */}
      <div
        style={{
          position: "relative", minHeight: 360,
          borderRadius: "var(--radius-lg)", overflow: "hidden",
          background: "color-mix(in oklch, var(--content-base) 3%, var(--background-default))",
          border: "1px solid var(--border-base)",
          display: "grid", placeItems: "center",
        }}
      >
        {processing && (
          <div style={{
            position: "absolute", inset: 0, display: "grid", placeItems: "center",
            background: "color-mix(in oklch, var(--background-default) 70%, transparent)", zIndex: 1,
          }}>
            <p style={{ margin: 0, color: "var(--content-subtle)" }}>Processing…</p>
          </div>
        )}
        <div
          ref={previewRef}
          style={{ maxWidth: "100%", maxHeight: 520, lineHeight: 0, display: "grid", placeItems: "center" }}
        />
        {!sourceSvg && !svgOutput && (
          <p style={{ position: "absolute", color: "var(--content-subtle)", margin: 0, fontSize: "var(--text-sm)" }}>
            Upload an SVG above to preview
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="primary" onClick={download} disabled={!svgOutput || processing}>Download SVG</Button>
        <Button variant="secondary" onClick={copy} disabled={!svgOutput || processing}>Copy SVG markup</Button>
        <Button variant="secondary" size="sm" onClick={togglePause} disabled={!svgOutput}>
          {paused ? "Play" : "Pause"}
        </Button>
        <Button
          variant="secondary" size="sm"
          onClick={() => { setSourceSvg(null); setSvgOutput(null); setFilename(""); setStatus("Upload an SVG to get started."); }}
          disabled={!sourceSvg}
        >
          Reset
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--content-subtle)" }}>{status}</p>
    </div>
  );
}
