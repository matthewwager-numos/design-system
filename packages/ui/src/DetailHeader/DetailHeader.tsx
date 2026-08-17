import { Fragment } from "react";
import type { ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";
import { clsx } from "clsx";
import "./DetailHeader.css";

export interface DetailHeaderProps {
  /** The parent list's name (e.g. "Employees") — not clickable, just context; closing is what `onClose` is for. */
  breadcrumb: ReactNode;
  /** This object's own name — doubles as the current breadcrumb crumb and the title below it. */
  title: ReactNode;
  /** Typically an `<Avatar size="xl">`. */
  avatar?: ReactNode;
  /** Pipe-separated meta line under the title (e.g. job title, department, role) — omit items that don't apply rather than passing empty strings. */
  meta?: ReactNode[];
  /** Trailing content in the title row — typically an actions `<DropdownMenu>`. */
  actions?: ReactNode;
  /** A horizontal `<Tabs>`/`<TabList>` for switching between this object's own sub-views. */
  tabs?: ReactNode;
  onClose: () => void;
  className?: string;
}

/**
 * The header for an object detail drawer/page — matches Figma's Drawer
 * template: a close button + breadcrumb, an avatar/title/meta identity row
 * with trailing actions, and a horizontal tabs row underneath. Distinct from
 * `<Header>` (its "app"/"modal" variants don't have a breadcrumb, avatar, or
 * meta line — this is a real third pattern, not a variant of either).
 */
export function DetailHeader({ breadcrumb, title, avatar, meta = [], actions, tabs, onClose, className }: DetailHeaderProps) {
  return (
    <div className={clsx("ds-detail-header", className)}>
      <div className="ds-detail-header__crumb-row">
        <button type="button" className="ds-detail-header__icon-button" onClick={onClose} aria-label="Close">
          <X size={16} aria-hidden />
        </button>
        <nav className="ds-detail-header__breadcrumb" aria-label="Breadcrumb">
          <span className="ds-detail-header__breadcrumb-link">{breadcrumb}</span>
          <ChevronRight size={12} className="ds-detail-header__breadcrumb-sep" aria-hidden />
          <span className="ds-detail-header__breadcrumb-current">{title}</span>
        </nav>
      </div>

      <div className="ds-detail-header__title-row">
        {avatar && <span className="ds-detail-header__avatar">{avatar}</span>}
        <div className="ds-detail-header__title-group">
          <p className="ds-detail-header__title">{title}</p>
          {meta.length > 0 && (
            <div className="ds-detail-header__meta">
              {meta.map((item, index) => (
                <Fragment key={index}>
                  {index > 0 && <span className="ds-detail-header__meta-sep" aria-hidden />}
                  <span>{item}</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="ds-detail-header__actions">{actions}</div>}
      </div>

      {tabs && <div className="ds-detail-header__tabs">{tabs}</div>}
    </div>
  );
}
