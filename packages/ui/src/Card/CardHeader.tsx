import type { ReactNode } from "react";
import { clsx } from "clsx";
import "./CardHeader.css";

export interface CardHeaderAction {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface CardHeaderProps {
  /** Typically an `<Avatar size="xs">` — omit for no leading visual at all. */
  lead?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Up to 3 trailing icon buttons — same "row actions" pattern as `<Cell type="icon">`. */
  actions?: CardHeaderAction[];
  className?: string;
}

/**
 * A Card's own header row: a small leading image, a title/subtitle text
 * block, and up to 3 trailing icon actions — matches Figma's `Card Header`
 * exactly (its own component, not part of `<Card>` itself, since Figma's
 * real Card content instance uses it twice — once as an actual header,
 * once as a plain button row at the bottom — so it's a reusable row
 * layout, not something `<Card>` should render on its own).
 */
export function CardHeader({ lead, title, subtitle, actions = [], className }: CardHeaderProps) {
  return (
    <div className={clsx("ds-card-header", className)}>
      {lead && <div className="ds-card-header__lead">{lead}</div>}
      <div className="ds-card-header__text">
        <p className="ds-card-header__title">{title}</p>
        {subtitle && <p className="ds-card-header__subtitle">{subtitle}</p>}
      </div>
      {actions.length > 0 && (
        <div className="ds-card-header__actions">
          {actions.slice(0, 3).map((action, index) => (
            <button
              key={index}
              type="button"
              className="ds-card-header__icon-button"
              // Stops here rather than reaching `<Card>`'s own onClick —
              // `<CardHeader>` is routinely composed inside a clickable
              // `<Card>` (see Card.tsx's own doc comment on why it isn't a
              // real `<button>`), so an action click would otherwise also
              // fire the card's click/selection handler.
              onClick={(event) => {
                event.stopPropagation();
                action.onClick?.();
              }}
              disabled={action.disabled}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
