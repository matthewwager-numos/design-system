import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { AppIcon, Badge, Button, GrainCorner, IconButton, Textarea } from "@numosai/ui";
import type { AppIconName } from "@numosai/ui";
import type { AssistantConversation } from "../components/AssistantPanel";
import type { PageId } from "./index";

export interface HomePageProps {
  /** The same conversation instance App.tsx lifts for both AssistantPanel renders — typing/submitting here feeds the exact same thread, not a separate one. */
  conversation: AssistantConversation;
  /** Opens the desktop squeeze panel so the reply is actually visible after submitting. */
  onOpenAssistant: () => void;
  /** Same `setPage` App.tsx already hands `NavContent` — a flow-diagram tile is just another way to reach an app's Overview tab, not a separate navigation concept. */
  onNavigate: (page: PageId) => void;
}

/** Placeholder "quick action" prompts — once a real model is wired up (see
 * `useAssistantConversation`'s `submitDraft`), picking one of these should
 * ideally route the user straight to the relevant app rather than just
 * dropping a canned reply in chat. That routing depends on the model
 * actually understanding intent, so for now this only does the half of the
 * job that's already real: submit the prompt into the same conversation
 * typing it and hitting Enter would. */
const SUGGESTED_PROMPTS = ["I want to add a teammate", "I want to connect a bank account"];

interface FlowTile {
  app: AppIconName;
  label: string;
  page: PageId;
}

/** The real `<AppIcon>` component, `size="lg"` — the same tile every app
 * switcher/header in this demo uses, not a one-off recreated here. */
const RECORD_TILES: FlowTile[] = [
  { app: "collect", label: "Collect", page: "collect" },
  { app: "pay", label: "Pay", page: "pay" },
  { app: "accruals", label: "Accrue", page: "accruals" },
  { app: "reconcile", label: "Reconcile", page: "reconcile" },
];

const CLOSE_TILE: FlowTile = { app: "close", label: "Close", page: "close" };

const REPORT_TILES: FlowTile[] = [
  { app: "analyze", label: "Analyze", page: "analyze" },
  { app: "forecast", label: "Forecast", page: "forecast" },
  { app: "communicate", label: "Communicate", page: "communicate" },
];

function FlowTileButton({ app, label, page, onNavigate }: FlowTile & { onNavigate: (page: PageId) => void }) {
  return (
    <button type="button" className="home-flow__tile" onClick={() => onNavigate(page)}>
      <span className="home-flow__tile-icon" aria-hidden>
        <span className="home-flow__tile-icon-crop">
          <AppIcon app={app} size="lg" />
          <GrainCorner color="var(--background-positive-base)" className="home-flow__tile-ornament" />
        </span>
        {app === "close" ? (
          <Badge size="lg" status="negative" className="home-flow__tile-badge">
            1d
          </Badge>
        ) : null}
      </span>
      <span className="home-flow__tile-label">{label}</span>
    </button>
  );
}

/** Measures `ref`'s own rendered pixel width (via ResizeObserver) — the connector SVGs below need real pixel coordinates, not the abstract 0–100 viewBox units a `preserveAspectRatio="none"` stretch would otherwise require, since a stretched viewBox distorts the bracket connectors' rounded corners into ellipses. */
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

const CONNECTOR_HEIGHT = 44;
const CONNECTOR_MID_Y = CONNECTOR_HEIGHT / 2;
const CONNECTOR_CORNER_RADIUS = 12;

interface Bracket {
  /** The shared horizontal span between the two outer corners — never gets an arrowhead, since it isn't itself a destination. */
  bar: string;
  /** One path per point: the two outer corners, plus a plain straight drop for every inner point (a T-junction landing directly on `bar`). */
  legs: string[];
}

/**
 * A single bracket (staple) shape spanning the outermost two of `xs` —
 * down/out from each end, a rounded corner, then one shared horizontal
 * bar between them — plus a plain straight drop for every other (inner)
 * point, landing directly on that same bar as a T-junction. Deliberately
 * NOT `count` individual elbows converging near the center: with 4 (or
 * more) points, that reads as clutter right where the "Record"/"Report"
 * label needs to sit, whereas a bracket keeps the middle clear.
 */
function bracketPaths(xs: number[]): Bracket {
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const r = Math.min(CONNECTOR_CORNER_RADIUS, (right - left) / 2);
  const legs = [
    `M ${left} 0 L ${left} ${CONNECTOR_MID_Y - r} Q ${left} ${CONNECTOR_MID_Y} ${left + r} ${CONNECTOR_MID_Y}`,
    `M ${right} 0 L ${right} ${CONNECTOR_MID_Y - r} Q ${right} ${CONNECTOR_MID_Y} ${right - r} ${CONNECTOR_MID_Y}`,
  ];
  for (const x of xs) {
    if (x !== left && x !== right) legs.push(`M ${x} 0 L ${x} ${CONNECTOR_MID_Y}`);
  }
  return { bar: `M ${left + r} ${CONNECTOR_MID_Y} L ${right - r} ${CONNECTOR_MID_Y}`, legs };
}

/** Mirror of `bracketPaths`, opening downward from the trunk instead of upward into it — each leg (bracket corner or inner straight drop) gets its own arrowhead, since every one is a real destination. */
function bracketPathsFromTrunk(xs: number[]): Bracket {
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const r = Math.min(CONNECTOR_CORNER_RADIUS, (right - left) / 2);
  const legs = [
    `M ${left + r} ${CONNECTOR_MID_Y} Q ${left} ${CONNECTOR_MID_Y} ${left} ${CONNECTOR_MID_Y + r} L ${left} ${CONNECTOR_HEIGHT}`,
    `M ${right - r} ${CONNECTOR_MID_Y} Q ${right} ${CONNECTOR_MID_Y} ${right} ${CONNECTOR_MID_Y + r} L ${right} ${CONNECTOR_HEIGHT}`,
  ];
  for (const x of xs) {
    if (x !== left && x !== right) legs.push(`M ${x} ${CONNECTOR_MID_Y} L ${x} ${CONNECTOR_HEIGHT}`);
  }
  return { bar: `M ${left + r} ${CONNECTOR_MID_Y} L ${right - r} ${CONNECTOR_MID_Y}`, legs };
}

/**
 * `count` evenly-spaced source points (one per tile in the row above)
 * converge into the single tile below — Collect/Pay/Accrue/Reconcile's own
 * Output all feeding Close, Record's own capstone step.
 */
function ConvergeConnector({ label, count }: { label: string; count: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const centerX = width / 2;
  const xs = Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * width);
  const { bar, legs } = bracketPaths(xs);

  return (
    <div className="home-flow__connector" ref={ref}>
      {width > 0 && (
        <svg className="home-flow__connector-svg" viewBox={`0 0 ${width} ${CONNECTOR_HEIGHT}`} aria-hidden="true">
          <path className="home-flow__connector-line" d={bar} />
          {legs.map((d, i) => (
            <path key={i} className="home-flow__connector-line" d={d} />
          ))}
          <path
            className="home-flow__connector-line"
            d={`M ${centerX} ${CONNECTOR_MID_Y} L ${centerX} ${CONNECTOR_HEIGHT}`}
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
  const { bar, legs } = bracketPathsFromTrunk(xs);

  return (
    <div className="home-flow__connector" ref={ref}>
      {width > 0 && (
        <svg className="home-flow__connector-svg" viewBox={`0 0 ${width} ${CONNECTOR_HEIGHT}`} aria-hidden="true">
          <path className="home-flow__connector-line" d={`M ${centerX} 0 L ${centerX} ${CONNECTOR_MID_Y}`} />
          <path className="home-flow__connector-line" d={bar} />
          {legs.map((d, i) => (
            <path key={i} className="home-flow__connector-line" d={d} />
          ))}
        </svg>
      )}
      <span className="home-flow__connector-label">{label}</span>
    </div>
  );
}

export function HomePage({ conversation, onOpenAssistant, onNavigate }: HomePageProps) {
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

  function selectSuggestion(text: string) {
    onOpenAssistant();
    conversation.submitDraft(text);
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

        <div className="home-prompt__suggestions">
          {SUGGESTED_PROMPTS.map((text) => (
            <Button
              key={text}
              variant="secondary"
              size="sm"
              className="home-prompt__suggestion"
              onClick={() => selectSuggestion(text)}
            >
              {text}
            </Button>
          ))}
        </div>

        <p className="home-hero__hint">Or, check on your monthly workflows...</p>

        <div className="home-flow">
          <div className="home-flow__row home-flow__row--4">
            {RECORD_TILES.map((tile) => (
              <FlowTileButton key={tile.label} {...tile} onNavigate={onNavigate} />
            ))}
          </div>

          <ConvergeConnector label="Record" count={RECORD_TILES.length} />

          <div className="home-flow__row home-flow__row--1">
            <FlowTileButton {...CLOSE_TILE} onNavigate={onNavigate} />
          </div>

          <DivergeConnector label="Report" count={REPORT_TILES.length} />

          <div className="home-flow__row home-flow__row--3">
            {REPORT_TILES.map((tile) => (
              <FlowTileButton key={tile.label} {...tile} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
