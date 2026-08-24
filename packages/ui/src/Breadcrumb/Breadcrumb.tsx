import type { MouseEvent, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: ReactNode;
  /** Renders as a real `<a href>` when given, a `<button>` when only `onClick` is given, or plain (non-interactive) text when neither is given. Ignored on the last item — see below. */
  href?: string;
  onClick?: (event: MouseEvent) => void;
}

export type BreadcrumbSeparator = "chevron" | "slash";

export interface BreadcrumbProps {
  /**
   * The trail, root first. The last item is always rendered as the current
   * page — plain text with `aria-current="page"`, never a link, regardless
   * of whether it has an `href`/`onClick` — matching Figma's own "Leaf"
   * crumb (a different color, not a link) and standard breadcrumb semantics
   * (you don't need to navigate to the page you're already on).
   */
  items: BreadcrumbItem[];
  /** Between each crumb. Figma's own icon is "chevron" (the default); "slash" is a common alternate convention. */
  separator?: BreadcrumbSeparator;
  className?: string;
}

/**
 * A trail of ancestor links back to some root, plus the current page —
 * matches Figma's Breadcrumbs exactly: Paragraph XS Regular throughout,
 * ancestor crumbs in `content-link-default` (real links), the current crumb
 * in `content-emphasis`, a 16px chevron between each with `space-2xs` (2px)
 * gaps on either side.
 */
export function Breadcrumb({ items, separator = "chevron", className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={clsx("ds-breadcrumb", className)}>
      <ol className="ds-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li className="ds-breadcrumb__item" key={index}>
              {isLast ? (
                <span className="ds-breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a href={item.href} className="ds-breadcrumb__link" onClick={item.onClick}>
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button type="button" className="ds-breadcrumb__link ds-breadcrumb__link--button" onClick={item.onClick}>
                  {item.label}
                </button>
              ) : (
                <span className="ds-breadcrumb__link">{item.label}</span>
              )}
              {!isLast && (
                <span className="ds-breadcrumb__separator" aria-hidden="true">
                  {separator === "slash" ? "/" : <ChevronRight size={16} />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
