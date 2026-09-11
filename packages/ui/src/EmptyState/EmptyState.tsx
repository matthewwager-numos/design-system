import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import "./EmptyState.css";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** A decorative icon (e.g. a `lucide-react` icon at `size={24}`) — rendered above the title, `--content-subtle`. Omit for a text-only empty state. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /**
   * Typically a `<ButtonGroup orientation="vertical">` of one or two
   * `<Button size="sm">`s (matching Figma's own reference exactly — a
   * `secondary` button above a `primary` one), but any content is fine.
   * Rendered as a plain flex child, so it stays its own natural width
   * rather than stretching to the rest of the empty state's centered
   * column.
   */
  actions?: ReactNode;
}

/**
 * A centered placeholder for an empty collection — a table with no rows yet,
 * a search with no matches, a list before its first item is added. Icon,
 * title, and description are all centered and `--content-subtle`, matching
 * Figma's own reference exactly; `actions` (if given) sits below, its own
 * natural width rather than stretched to the text above.
 *
 * Purely a content block — no card, border, or background of its own, since
 * whatever it's replacing (a table body, a card, a page section) already
 * provides that chrome. Renders in place wherever it's put; centering itself
 * within a larger region (e.g. a tall empty table) is the parent's job, not
 * this component's.
 */
export function EmptyState({ icon, title, description, actions, className, ...rest }: EmptyStateProps) {
  return (
    <div className={clsx("ds-empty-state", className)} {...rest}>
      {icon ? (
        <span className="ds-empty-state__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <p className="ds-empty-state__title">{title}</p>
      {description ? <div className="ds-empty-state__description">{description}</div> : null}
      {actions}
    </div>
  );
}
