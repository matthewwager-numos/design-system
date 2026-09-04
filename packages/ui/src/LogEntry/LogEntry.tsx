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
 */
export function LogEntry({ subject, description, actor, timestamp, className }: LogEntryProps) {
  return (
    <div className={clsx("ds-log-entry", className)}>
      <div className="ds-log-entry__rail">
        <span className="ds-log-entry__line ds-log-entry__line--top" aria-hidden />
        <span className="ds-log-entry__dot" aria-hidden />
        <span className="ds-log-entry__line ds-log-entry__line--bottom" aria-hidden />
      </div>
      <div className="ds-log-entry__content">
        <p className="ds-log-entry__text">
          {subject ? <span className="ds-log-entry__subject">{subject} </span> : null}
          <span className="ds-log-entry__description">{description}</span>
        </p>
        <p className="ds-log-entry__byline">
          <span>by </span>
          <span className="ds-log-entry__actor">{actor}</span>
          <span> • </span>
          <span>on {timestamp}</span>
        </p>
      </div>
    </div>
  );
}
