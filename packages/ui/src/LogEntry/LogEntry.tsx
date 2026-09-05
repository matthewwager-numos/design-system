import type { ReactNode } from "react";
import { clsx } from "clsx";
import "./LogEntry.css";

export interface LogEntryProps {
  /** The bold, link-colored lead segment — typically the record's own name (e.g. `"Mary Jane's"`). Omit for an entry with no single clear subject. */
  subject?: ReactNode;
  /** The rest of the sentence — what happened, and however much of where/why/how belongs in it (e.g. `"employment status changed from full-time to part-time"`). */
  description: ReactNode;
  /** Who performed the action — rendered as a link-colored name in the byline. */
  actor: ReactNode;
  /** When it happened — already-formatted text (e.g. `"Sep 15, 2026 at 3:45p PST"`), not a `Date` — this component doesn't format dates itself. */
  timestamp: ReactNode;
  /** Renders `subject` as a real button (e.g. to open that record's own detail view) instead of plain text. Omit when there's nothing to open — a departed employee, a settings change with no single record behind it, etc. */
  onSubjectClick?: () => void;
  /** Same idea, for `actor` — the byline's own name is just as often a real, clickable record (whoever performed the action) as `subject` is. */
  onActorClick?: () => void;
  className?: string;
}

/**
 * One entry in a chronological changelog/audit-log feed — matches Figma's
 * LogEntry exactly. Stack several directly (no gap needed between them —
 * see the CSS) to get a continuous connecting timeline: each entry's own
 * fixed-height top stub lines up with the previous entry's flexible bottom
 * segment, so the dots read as one continuous vertical line down the page
 * with a marker at each entry, not disconnected per-row fragments.
 *
 * Deliberately not one combined `text` prop — `subject` (bold, link-colored)
 * and `description` (plain) are two genuinely different type styles in
 * Figma (Paragraph S Medium vs. Heading S, of all things — an intentional,
 * if oddly-named, pairing confirmed from the file itself, not a typo here).
 *
 * `subject`/`actor` render as real `<button>`s (not `<a href>` — there's no
 * real URL, just "open this record's detail view somewhere else on the
 * page") whenever `onSubjectClick`/`onActorClick` is given, matching the
 * link-blue color they already render in either way.
 */
export function LogEntry({ subject, description, actor, timestamp, onSubjectClick, onActorClick, className }: LogEntryProps) {
  return (
    <div className={clsx("ds-log-entry", className)}>
      <div className="ds-log-entry__rail">
        <span className="ds-log-entry__line ds-log-entry__line--top" aria-hidden />
        <span className="ds-log-entry__dot" aria-hidden />
        <span className="ds-log-entry__line ds-log-entry__line--bottom" aria-hidden />
      </div>
      <div className="ds-log-entry__content">
        <p className="ds-log-entry__text">
          {subject ? (
            <>
              {onSubjectClick ? (
                <button type="button" className="ds-log-entry__subject" onClick={onSubjectClick}>
                  {subject}
                </button>
              ) : (
                <span className="ds-log-entry__subject">{subject}</span>
              )}{" "}
            </>
          ) : null}
          <span className="ds-log-entry__description">{description}</span>
        </p>
        <p className="ds-log-entry__byline">
          <span>by </span>
          {onActorClick ? (
            <button type="button" className="ds-log-entry__actor" onClick={onActorClick}>
              {actor}
            </button>
          ) : (
            <span className="ds-log-entry__actor">{actor}</span>
          )}
          <span> • </span>
          <span>on {timestamp}</span>
        </p>
      </div>
    </div>
  );
}
