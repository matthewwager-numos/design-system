import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { IconButton } from "../IconButton";
import "./Carousel.css";

export interface CarouselProps {
  /** Each element is one slide, shown one at a time in the viewer. */
  slides: ReactNode[];
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
  /** The dot row below the viewer. Defaults to true. */
  showDots?: boolean;
  /** Announced as this region's accessible name — describe what the slides are (e.g. "Product photos"), not the word "carousel" itself. */
  "aria-label"?: string;
  className?: string;
}

/**
 * A single-slide-at-a-time viewer with previous/next arrows and dot
 * indicators — matches Figma's Carousel exactly: `<IconButton
 * variant="secondary" size="md">` arrows (confirmed identical treatment,
 * right down to its disabled state — see IconButton's own docs), and dots
 * where the active one is a wider pill (`content-brand-primary`) among
 * plain circles (`background-element`). Figma's own mockup is a single
 * static slot; sliding between real `slides` via a translated track is a
 * genuine implementation, not a reproduction of that placeholder.
 */
export function Carousel({
  slides,
  loop = false,
  defaultIndex = 0,
  index: controlledIndex,
  onIndexChange,
  showDots = true,
  "aria-label": ariaLabel = "Carousel",
  className,
}: CarouselProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const index = controlledIndex ?? uncontrolledIndex;
  const count = slides.length;

  function goTo(next: number) {
    const clamped = loop ? (next + count) % count : Math.min(Math.max(next, 0), count - 1);
    setUncontrolledIndex(clamped);
    onIndexChange?.(clamped);
  }

  const atStart = index === 0;
  const atEnd = index === count - 1;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  }

  return (
    <div
      className={clsx("ds-carousel", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <div className="ds-carousel__viewer">
        <IconButton
          variant="secondary"
          size="md"
          icon={<ChevronLeft size={24} />}
          aria-label="Previous slide"
          disabled={!loop && atStart}
          onClick={() => goTo(index - 1)}
        />
        <div className="ds-carousel__slot">
          <div className="ds-carousel__track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {slides.map((slide, i) => (
              <div className="ds-carousel__slide" role="group" aria-roledescription="slide" aria-label={`Slide ${i + 1} of ${count}`} aria-hidden={i !== index} key={i}>
                {slide}
              </div>
            ))}
          </div>
        </div>
        <IconButton
          variant="secondary"
          size="md"
          icon={<ChevronRight size={24} />}
          aria-label="Next slide"
          disabled={!loop && atEnd}
          onClick={() => goTo(index + 1)}
        />
      </div>
      {showDots && count > 1 && (
        <div className="ds-carousel__dots">
          {slides.map((_, i) => (
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
      )}
    </div>
  );
}
