import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { IconButton } from "../IconButton";
import "./Carousel.css";

// Below this many pixels of horizontal drag, a release counts as a tap/click
// (or an aborted swipe) and the track just snaps back to where it was.
const SWIPE_THRESHOLD_PX = 50;

export type CarouselControlsPlacement = "perimeter" | "overlay";

export interface CarouselProps {
  /** Each element is one slide. */
  slides: ReactNode[];
  /** How many slides are visible side by side at once. Defaults to 1 (Figma's original single-slide variant) — a Figma variant showing multiple slides in view is `itemsPerView={2}`/`{3}`/etc. Navigation still steps one slide at a time (a sliding window), not by a full page of `itemsPerView` slides. */
  itemsPerView?: number;
  /**
   * Wrap from the last slide back to the first (and vice versa) instead of
   * disabling the arrows at the ends. Defaults to false, matching Figma's
   * own example (shown on the first slide, with the "previous" arrow
   * disabled rather than wrapping).
   */
  loop?: boolean;
  /** Uncontrolled initial slide. */
  defaultIndex?: number;
  /** Controlled active slide index. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /**
   * The prev/next arrow buttons. Defaults to true — set to false at mobile
   * sizes where a swipe gesture (always available regardless of this prop,
   * on both touch and mouse) is preferred over on-screen buttons.
   */
  showButtons?: boolean;
  /**
   * "perimeter" (default) sits the arrows outside the slot, in their own
   * row — "overlay" floats them on top of the slide content instead (with
   * a fixed dark scrim + light icon regardless of theme, since they're
   * sitting on arbitrary media, not the page background), for full-bleed
   * content — a photo, a video — where a separate row would just waste
   * space.
   */
  buttonPlacement?: CarouselControlsPlacement;
  /** The dot row. Defaults to true. */
  showDots?: boolean;
  /** Same "perimeter" (default, its own row below the slot) vs "overlay" (floating over the bottom edge of the slide content) choice as `buttonPlacement`, set independently — you can mix, e.g. perimeter arrows with overlaid dots. */
  dotPlacement?: CarouselControlsPlacement;
  /** Announced as this region's accessible name — describe what the slides are (e.g. "Product photos"), not the word "carousel" itself. */
  "aria-label"?: string;
  className?: string;
}

/**
 * A slide viewer with previous/next arrows, dot indicators, and drag/swipe
 * navigation — matches Figma's Carousel exactly: `<IconButton
 * variant="secondary" size="md">` arrows (confirmed identical treatment,
 * right down to its disabled state — see IconButton's own docs), and dots
 * where the active one is a wider pill (`content-brand-primary`) among
 * plain circles (`background-element`). Figma's own mockup is a single
 * static slot; sliding between real `slides` via a translated track is a
 * genuine implementation, not a reproduction of that placeholder.
 *
 * `itemsPerView > 1` is a second Figma variant (multiple slides visible at
 * once) rather than a different component — the track/slide sizing and the
 * translate-per-step math below are both generalized from a single fixed
 * `100%` to `100% / itemsPerView` (accounting for the gap between visible
 * slides), and `index`'s valid range shrinks to `[0, count - itemsPerView]`
 * so the window never scrolls past the last slide into empty space.
 *
 * Each slide sizes to its own content — nothing here imposes a height, so
 * the same component works for a strip of small thumbnails or a single
 * full-screen image, and the viewer's own height smoothly follows whichever
 * slide(s) are actually on screen as you navigate between differently-sized
 * ones (see the `slotHeight`/`ResizeObserver` effect below).
 */
export function Carousel({
  slides,
  itemsPerView = 1,
  loop = false,
  defaultIndex = 0,
  index: controlledIndex,
  onIndexChange,
  showButtons = true,
  buttonPlacement = "perimeter",
  showDots = true,
  dotPlacement = "perimeter",
  "aria-label": ariaLabel = "Carousel",
  className,
}: CarouselProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const index = controlledIndex ?? uncontrolledIndex;
  const count = slides.length;
  // The last valid *start* position for the visible window, not the last
  // slide — e.g. 5 slides at itemsPerView=2 can only start at 0..3, since
  // starting at 4 would leave the window's second half empty.
  const maxIndex = Math.max(0, count - itemsPerView);
  const positionCount = maxIndex + 1;

  function goTo(next: number) {
    const clamped = loop ? ((next % positionCount) + positionCount) % positionCount : Math.min(Math.max(next, 0), maxIndex);
    setUncontrolledIndex(clamped);
    onIndexChange?.(clamped);
  }

  const atStart = index === 0;
  const atEnd = index === maxIndex;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  }

  // Drag/swipe: a live pixel offset added on top of the resting transform
  // while a pointer is down, mixed directly into the same `calc()` as a
  // `px` term alongside the `%`-based step — CSS handles mixed units in one
  // `calc()` natively, so there's no need to measure the slot's pixel width
  // just to convert a drag distance into a percentage. `dragging` (not just
  // "offset !== 0") separately gates the CSS transition: off while a
  // pointer is actively down so the track follows the finger/cursor
  // instantly with no easing lag, back on the instant it's released so the
  // snap to the resting position (whether that's a new slide or back to the
  // old one) animates instead of jumping.
  const dragStartX = useRef(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (count <= 1) return;
    dragStartX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragOffsetPx(event.clientX - dragStartX.current);
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    if (dragOffsetPx <= -SWIPE_THRESHOLD_PX) goTo(index + 1);
    else if (dragOffsetPx >= SWIPE_THRESHOLD_PX) goTo(index - 1);
    setDragging(false);
    setDragOffsetPx(0);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  // Tracks just the currently-*visible* slide(s)' own natural height (not
  // the tallest slide overall — `.ds-carousel__track` deliberately doesn't
  // stretch every slide to match, see Carousel.css) so the viewer matches
  // whatever's actually on screen. A ResizeObserver, not just a recompute on
  // `index` change, so a slide whose content loads/resizes late (an `<img>`
  // with no predeclared dimensions) still corrects the height once it does.
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [slotHeight, setSlotHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const visible = slideRefs.current.slice(index, index + itemsPerView).filter((el): el is HTMLDivElement => el !== null);
    if (visible.length === 0) return;

    function measure() {
      setSlotHeight(Math.max(...visible.map((el) => el.getBoundingClientRect().height)));
    }
    measure();
    const observer = new ResizeObserver(measure);
    visible.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [index, itemsPerView, count]);

  const slideBasis = `((100% - ${itemsPerView - 1} * var(--ds-carousel-gap)) / ${itemsPerView})`;
  const step = `(${slideBasis} + var(--ds-carousel-gap))`;

  const dots = showDots && positionCount > 1 && (
    <div className={clsx("ds-carousel__dots", dotPlacement === "overlay" && "ds-carousel__dots--overlay")}>
      {Array.from({ length: positionCount }, (_, i) => (
        <button
          type="button"
          key={i}
          className={clsx("ds-carousel__dot", i === index && "ds-carousel__dot--active")}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === index || undefined}
          onClick={() => goTo(i)}
        />
      ))}
    </div>
  );

  return (
    <div
      className={clsx("ds-carousel", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <div className={clsx("ds-carousel__viewer", buttonPlacement === "overlay" && "ds-carousel__viewer--buttons-overlay")}>
        {showButtons && (
          <IconButton
            variant="secondary"
            size="md"
            className={clsx(buttonPlacement === "overlay" && "ds-carousel__button ds-carousel__button--prev")}
            icon={<ChevronLeft size={24} />}
            aria-label="Previous slide"
            disabled={!loop && atStart}
            onClick={() => goTo(index - 1)}
          />
        )}
        <div
          className="ds-carousel__slot"
          style={{ height: slotHeight != null ? `${slotHeight}px` : undefined }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className={clsx("ds-carousel__track", dragging && "ds-carousel__track--dragging")}
            style={
              {
                "--ds-carousel-slide-basis": slideBasis,
                transform: `translateX(calc(-1 * ${index} * ${step} + ${dragOffsetPx}px))`,
              } as CSSProperties
            }
          >
            {slides.map((slide, i) => (
              <div
                className="ds-carousel__slide"
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} of ${count}`}
                aria-hidden={i < index || i >= index + itemsPerView}
                key={i}
              >
                {slide}
              </div>
            ))}
          </div>
          {dotPlacement === "overlay" && dots}
        </div>
        {showButtons && (
          <IconButton
            variant="secondary"
            size="md"
            className={clsx(buttonPlacement === "overlay" && "ds-carousel__button ds-carousel__button--next")}
            icon={<ChevronRight size={24} />}
            aria-label="Next slide"
            disabled={!loop && atEnd}
            onClick={() => goTo(index + 1)}
          />
        )}
      </div>
      {dotPlacement === "perimeter" && dots}
    </div>
  );
}
