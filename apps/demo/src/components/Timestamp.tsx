import { formatDate, formatTime } from "../data/formatDate";

export interface TimestampProps {
  date: Date;
  className?: string;
}

/**
 * A date + time pair, stacked (date over time) below the desktop breakpoint
 * and inline (date, time) above it — see `.timestamp` in app.css. Typography
 * and color come from whatever context class a consumer passes in (e.g.
 * `list-detail-row__timestamp`), cascading down to both lines rather than
 * repeating them here, so this stays a pure layout wrapper around
 * `formatDate`/`formatTime`.
 */
export function Timestamp({ date, className }: TimestampProps) {
  return (
    <span className={`timestamp${className ? ` ${className}` : ""}`}>
      <span className="timestamp__date">{formatDate(date)}</span>
      <span className="timestamp__time">{formatTime(date)}</span>
    </span>
  );
}
