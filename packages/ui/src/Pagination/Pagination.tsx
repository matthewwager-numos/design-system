import { useEffect, useId, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import "./Pagination.css";

export interface PaginationProps {
  /** Controlled current page (1-indexed). Omit to let Pagination manage its own. */
  page?: number;
  defaultPage?: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(1, totalPages), Math.max(1, page));
}

/**
 * Prev/next icon buttons around a real, editable page-number field — matches
 * Figma's Pagination exactly, including a detail easy to miss in its single
 * static example: the disabled Prev button and the enabled Next button use
 * two different confirmed colors (Content/Disabled vs. Content/Brand
 * Primary), not one icon color with an opacity fade.
 *
 * The page number is a genuine `<input>` (Figma reuses its own Text Input
 * component for it), not a static label — type a page and press Enter (or
 * blur) to jump there, the same "real control, not a display" philosophy as
 * everywhere else in this library.
 */
export function Pagination({ page: controlledPage, defaultPage = 1, totalPages, onPageChange, disabled = false, className }: PaginationProps) {
  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const page = clampPage(controlledPage ?? uncontrolledPage, totalPages);

  const [draft, setDraft] = useState(String(page));
  const inputId = useId();

  // Keep the draft text in sync with the real page whenever it changes from
  // outside an in-progress edit (prev/next, or a controlled parent) — but
  // never overwrite what's actively being typed.
  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  function commit(next: number) {
    const clamped = clampPage(next, totalPages);
    setUncontrolledPage(clamped);
    onPageChange?.(clamped);
    return clamped;
  }

  function commitDraft() {
    const parsed = Number.parseInt(draft, 10);
    const next = Number.isNaN(parsed) ? page : commit(parsed);
    setDraft(String(next));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Deliberately doesn't blur the field after either key: blur fires
    // commitDraft() too (so a later Tab-away/click-away still commits
    // normally), and forcing it synchronously here would re-read `draft`
    // before this render's setDraft has actually landed — reverting via
    // Escape and then immediately blurring would re-commit the stale,
    // pre-revert text instead of discarding it.
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDraft(String(page));
    }
  }

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav aria-label="Pagination" className={clsx("ds-pagination", className)}>
      <button
        type="button"
        className="ds-pagination__button"
        onClick={() => commit(page - 1)}
        disabled={disabled || isFirstPage}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden />
      </button>

      <div className="ds-pagination__field">
        <label className="ds-sr-only" htmlFor={inputId}>
          Page number
        </label>
        <input
          id={inputId}
          className="ds-pagination__input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commitDraft}
          onKeyDown={handleKeyDown}
          aria-label={`Page, ${page} of ${totalPages}`}
        />
      </div>

      <span className="ds-pagination__total">of {totalPages}</span>

      <button
        type="button"
        className="ds-pagination__button"
        onClick={() => commit(page + 1)}
        disabled={disabled || isLastPage}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}
