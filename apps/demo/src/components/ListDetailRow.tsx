import { forwardRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Checkbox } from "@numosai/ui";

export interface ListDetailRowProps {
  /** Used only for the checkbox's own `aria-label` when `title` isn't a plain string. */
  id: string;
  title: ReactNode;
  description: ReactNode;
  /** Renders the title at regular weight/`--content-base` instead of medium/`--content-emphasis` — this row has been viewed at least once, same "read" convention an email client uses. */
  read?: boolean;
  checked: boolean;
  /** This row's own detail is the one currently shown. Reuses `--background-selected` (see `.list-detail-row--focused` in app.css) rather than a separate outline/ring. */
  focused?: boolean;
  /** Flush-right content — e.g. a timestamp + attachment icon, or a compact reference. Omit for none. */
  meta?: ReactNode;
  onCheckChange: () => void;
  onFocusRow: () => void;
  /** The one thing each consumer supplies itself: what Up/Down/Tab/Escape/Enter actually *do* here differs by context (e.g. Escape clears just this row's focus in an inbox, but closes the whole modal in a full-screen review flow) — this component only renders and reports the key, it doesn't interpret it. */
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * One row in a checkbox-selectable List & Detail widget — "selected" (its
 * own checkbox, independent bulk-action state) and "focused" (this is the
 * one whose detail is showing) are two distinct, independently-tracked
 * states, not one. Shared by every consumer of this interaction pattern in
 * this demo (Notifications' own Inbox, Collect's bulk-action review modal)
 * so a row looks and behaves identically wherever it appears, rather than
 * each screen hand-rolling its own slightly-different version.
 *
 * `onFocusRow` fires on both `onClick` and the real `onFocus` event — a
 * click already focuses the button in most browsers, but not reliably in
 * every one (Safari's default), and either way this is what keeps "which
 * row is focused" and "which detail shows" as literally the same state
 * rather than two things a consumer has to keep in sync by hand. Forwards
 * its ref so a consumer can build a roving Up/Down focus list across rows.
 */
export const ListDetailRow = forwardRef<HTMLButtonElement, ListDetailRowProps>(function ListDetailRow(
  { id, title, description, read, checked, focused, meta, onCheckChange, onFocusRow, onKeyDown },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`list-detail-row${focused ? " list-detail-row--focused" : ""}`}
      onClick={onFocusRow}
      onFocus={onFocusRow}
      onKeyDown={onKeyDown}
    >
      <span className="list-detail-row__check" onClick={(event) => event.stopPropagation()}>
        <Checkbox checked={checked} onChange={onCheckChange} aria-label={`Select ${typeof title === "string" ? title : id}`} tabIndex={-1} />
      </span>
      <span className="list-detail-row__body">
        <span className={`list-detail-row__title${read ? " list-detail-row__title--read" : ""}`}>{title}</span>
        <span className="list-detail-row__description">{description}</span>
      </span>
      {meta ? <span className="list-detail-row__meta">{meta}</span> : null}
    </button>
  );
});
