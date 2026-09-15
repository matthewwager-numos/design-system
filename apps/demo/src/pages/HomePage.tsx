import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, Banknote, Calculator, CheckSquare, FlaskConical, Inbox, RadioTower, Scale, Sparkles, Telescope } from "lucide-react";
import { GrainCorner, IconButton, Textarea } from "@numosai/ui";
import type { AssistantConversation } from "../components/AssistantPanel";

export interface HomePageProps {
  /** The same conversation instance App.tsx lifts for both AssistantPanel renders — typing/submitting here feeds the exact same thread, not a separate one. */
  conversation: AssistantConversation;
  /** Opens the desktop squeeze panel so the reply is actually visible after submitting. */
  onOpenAssistant: () => void;
}

interface FlowTile {
  icon: LucideIcon;
  label: string;
}

/** Same icon per app as `NavContent.tsx` — one visual identity for each workflow, reused everywhere it appears. */
const RECORD_TILES: FlowTile[] = [
  { icon: Inbox, label: "Collect" },
  { icon: Banknote, label: "Pay" },
  { icon: Calculator, label: "Accrue" },
  { icon: Scale, label: "Reconcile" },
];

const CLOSE_TILE: FlowTile = { icon: CheckSquare, label: "Close" };

const REPORT_TILES: FlowTile[] = [
  { icon: FlaskConical, label: "Analyze" },
  { icon: Telescope, label: "Forecast" },
  { icon: RadioTower, label: "Communicate" },
];

function FlowTileButton({ icon: Icon, label }: FlowTile) {
  return (
    <div className="home-flow__tile">
      <span className="app-icon-tile app-icon-tile--lg home-flow__tile-icon" aria-hidden>
        <Icon size={48} />
        <GrainCorner color="var(--background-positive-base)" className="home-flow__tile-ornament" />
      </span>
      <span className="home-flow__tile-label">{label}</span>
    </div>
  );
}

/** Measures `ref`'s own rendered pixel width (via ResizeObserver) — the connector SVGs below need real pixel coordinates, not the abstract 0–100 viewBox units a `preserveAspectRatio="none"` stretch would otherwise require, since a stretched viewBox distorts the elbow connectors' rounded corners into ellipses. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setWidth(entries[0]!.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

const CONNECTOR_HEIGHT = 64;
const CONNECTOR_MID_Y = CONNECTOR_HEIGHT / 2;
const CONNECTOR_CORNER_RADIUS = 12;

/** A rounded 90°-ish elbow from `(x, 0)` down to the shared horizontal trunk at `(centerX, midY)` — straight down, then a rounded corner, then straight across, matching an orthogonal "bus" connector rather than a single smooth curve. */
function elbowToTrunk(x: number, centerX: number): string {
  const dir = Math.sign(centerX - x);
  if (dir === 0) return `M ${x} 0 L ${x} ${CONNECTOR_MID_Y}`;
  const r = Math.min(CONNECTOR_CORNER_RADIUS, Math.abs(centerX - x));
  return `M ${x} 0 L ${x} ${CONNECTOR_MID_Y - r} Q ${x} ${CONNECTOR_MID_Y} ${x + dir * r} ${CONNECTOR_MID_Y} L ${centerX} ${CONNECTOR_MID_Y}`;
}

/** Mirror of `elbowToTrunk` — from the shared trunk out to `(x, height)`. */
function elbowFromTrunk(x: number, centerX: number): string {
  const dir = Math.sign(x - centerX);
  if (dir === 0) return `M ${centerX} ${CONNECTOR_MID_Y} L ${x} ${CONNECTOR_HEIGHT}`;
  const r = Math.min(CONNECTOR_CORNER_RADIUS, Math.abs(x - centerX));
  return `M ${centerX} ${CONNECTOR_MID_Y} L ${x - dir * r} ${CONNECTOR_MID_Y} Q ${x} ${CONNECTOR_MID_Y} ${x} ${CONNECTOR_MID_Y + r} L ${x} ${CONNECTOR_HEIGHT}`;
}

/**
 * `count` evenly-spaced source points (one per tile in the row above)
 * converge into the single tile below — Collect/Pay/Accrue/Reconcile's own
 * Output all feeding Close, Record's own capstone step. Each drops straight
 * down, bends through a rounded corner, and merges into one shared
 * horizontal trunk (an orthogonal "bus" connector, not a smooth S-curve) —
 * a single arrow then continues from the trunk down into the tile below.
 */
function ConvergeConnector({ label, count }: { label: string; count: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const centerX = width / 2;
  const xs = Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * width);

  return (
    <div className="home-flow__connector" ref={ref}>
      {width > 0 && (
        <svg className="home-flow__connector-svg" viewBox={`0 0 ${width} ${CONNECTOR_HEIGHT}`} aria-hidden="true">
          {xs.map((x, i) => (
            <path key={i} className="home-flow__connector-line" d={elbowToTrunk(x, centerX)} />
          ))}
          <path
            className="home-flow__connector-line"
            d={`M ${centerX} ${CONNECTOR_MID_Y} L ${centerX} ${CONNECTOR_HEIGHT - 2}`}
            markerEnd="url(#home-flow-arrow)"
          />
        </svg>
      )}
      <span className="home-flow__connector-label">{label}</span>
    </div>
  );
}

/** Mirror of `ConvergeConnector` — the single tile above (Close) fans out into `count` evenly-spaced targets below (Analyze/Forecast/Communicate). */
function DivergeConnector({ label, count }: { label: string; count: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const centerX = width / 2;
  const xs = Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * width);

  return (
    <div className="home-flow__connector" ref={ref}>
      {width > 0 && (
        <svg className="home-flow__connector-svg" viewBox={`0 0 ${width} ${CONNECTOR_HEIGHT}`} aria-hidden="true">
          <path className="home-flow__connector-line" d={`M ${centerX} 0 L ${centerX} ${CONNECTOR_MID_Y}`} />
          {xs.map((x, i) => (
            <path key={i} className="home-flow__connector-line" d={elbowFromTrunk(x, centerX)} markerEnd="url(#home-flow-arrow)" />
          ))}
        </svg>
      )}
      <span className="home-flow__connector-label">{label}</span>
    </div>
  );
}

export function HomePage({ conversation, onOpenAssistant }: HomePageProps) {
  function submit() {
    if (!conversation.draft.trim()) return;
    onOpenAssistant();
    conversation.submitDraft();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="app-body">
      <div className="home-hero">
        <h1 className="home-hero__greeting">Hello, Matt</h1>

        <form className="home-prompt" onSubmit={handleSubmit}>
          <Textarea
            className="home-prompt__input"
            leadingIcon={<Sparkles size={16} />}
            value={conversation.draft}
            onChange={(event) => conversation.setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What can Numos do for you today?"
            aria-label="Ask Numos"
            rows={1}
            autoFocus
          />
          <IconButton
            type="submit"
            variant="primary"
            size="md"
            icon={<ArrowUp size={20} />}
            aria-label="Send"
            disabled={!conversation.draft.trim()}
          />
        </form>

        {/* Referenced by both connectors' own `markerEnd` below — one shared definition, not duplicated per <svg>, since marker ids resolve document-wide. */}
        <svg width="0" height="0" aria-hidden="true">
          <defs>
            <marker id="home-flow-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
        </svg>

        <div className="home-flow">
          <div className="home-flow__row home-flow__row--4">
            {RECORD_TILES.map((tile) => (
              <FlowTileButton key={tile.label} {...tile} />
            ))}
          </div>

          <ConvergeConnector label="Record" count={RECORD_TILES.length} />

          <div className="home-flow__row home-flow__row--1">
            <FlowTileButton {...CLOSE_TILE} />
          </div>

          <DivergeConnector label="Report" count={REPORT_TILES.length} />

          <div className="home-flow__row home-flow__row--3">
            {REPORT_TILES.map((tile) => (
              <FlowTileButton key={tile.label} {...tile} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
