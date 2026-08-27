import type { DragEvent, KeyboardEvent, ReactNode } from "react";
import { clsx } from "clsx";
import { useCardGroupContext } from "./CardGroupContext";
import "./Card.css";

export type CardExpand = "x" | "y" | "both";

export interface CardProps {
  children: ReactNode;
  /**
   * Identifies this card within a parent `<CardGroup type="single">` —
   * matches a `<Radio>`'s own `value`. Not needed standalone, or inside a
   * `type="multiple"` group: multi-select has no shared value to match
   * against, same as a `<Checkbox>` inside `<CheckboxGroup>`.
   */
  value?: string;
  /**
   * Real, controlled app state (is this card the current selection?), not a
   * CSS-discoverable state like hover — swaps the card's default drop
   * shadow for a `border-brand` outline + brand-subdued focus ring. Ignored
   * inside a `<CardGroup type="single">` when this card has a `value` —
   * the group's own selected value is the one source of truth there,
   * same as `<Radio>` ignoring a `checked` prop of its own inside a group.
   */
  selected?: boolean;
  /**
   * Lets the card grow beyond its fixed 400px default along one axis or
   * both — omit for a plain fixed-size card (Figma's own default). Fills
   * 100% of whatever the parent gives it on that axis; pair with
   * `minWidth`/`maxWidth`/`minHeight`/`maxHeight` to clamp that fill to a
   * band instead of an unconditional 100%. A generic sizing knob rather
   * than Figma's own single hardcoded 400→480px jump — Figma's two Card
   * variants show no content difference beyond width, so there's nothing
   * about a "correct" expanded size worth baking in as a fixed value.
   */
  expand?: CardExpand;
  /** Only applies when `expand` is `"x"` or `"both"`. Any CSS length (e.g. `"20rem"`, `"320px"`). */
  minWidth?: string;
  maxWidth?: string;
  /** Only applies when `expand` is `"y"` or `"both"`. Any CSS length. */
  minHeight?: string;
  maxHeight?: string;
  onClick?: () => void;
  /**
   * Sets the native `draggable` attribute — real HTML5 drag-and-drop, not a
   * custom gesture system, so it composes with `onDragStart`/`onDragEnd`
   * (this card as the drag source) the same way any plain draggable
   * element would. The drop side (a container's own `onDragOver`/`onDrop`)
   * lives wherever that container is, same as it would for a native
   * element — a `<Card>` only needs to know it's draggable, not who's
   * accepting it.
   */
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLDivElement>) => void;
  className?: string;
}

/**
 * A clickable card shell — matches Figma's Card exactly. `selected` is a
 * real prop (unknowable app state); the hover chrome (a `border-emphasis`
 * outline) is a real `:hover`, not a prop, per this design system's own
 * "real CSS state over guessed prop" rule.
 *
 * A `role="button"` div, not a real `<button>` — Figma's own Card is
 * modeled as a button, but its real content (e.g. `<CardHeader>`'s own
 * icon-button actions) nests other interactive controls inside it, and a
 * `<button>` can't legally contain another `<button>`: the browser silently
 * closes the outer one, which un-nests it from the DOM entirely (confirmed
 * by inspecting the rendered tree — the outer element stopped containing
 * its own header's action buttons). `tabIndex`/`onKeyDown` reproduce real
 * button keyboard behavior (Enter and Space both activate it) without that
 * constraint.
 */
export function Card({
  children,
  value,
  selected: controlledSelected = false,
  expand,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
  className,
}: CardProps) {
  const group = useCardGroupContext();
  const grouped = group?.type === "single" && value !== undefined;
  const selected = grouped ? group!.value === value : controlledSelected;

  const expandX = expand === "x" || expand === "both";
  const expandY = expand === "y" || expand === "both";

  function handleClick() {
    if (grouped) group!.onSelect(value!);
    onClick?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleClick();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={clsx("ds-card", expandX && "ds-card--expand-x", expandY && "ds-card--expand-y", className)}
      data-selected={selected}
      aria-pressed={selected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        minWidth: expandX ? minWidth : undefined,
        maxWidth: expandX ? maxWidth : undefined,
        minHeight: expandY ? minHeight : undefined,
        maxHeight: expandY ? maxHeight : undefined,
      }}
    >
      {children}
    </div>
  );
}
