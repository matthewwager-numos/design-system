import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { clsx } from "clsx";
import { Avatar } from "../Avatar";
import type { AvatarProps } from "../Avatar";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { ProgressBar } from "../ProgressBar";
import "./Cell.css";

export type CellType =
  | "text"
  | "numeric"
  | "emphasis"
  | "double"
  | "null"
  | "loading"
  | "slot"
  | "progress"
  | "label"
  | "button"
  | "avatar"
  | "checkbox"
  | "icon"
  | "columnHead"
  | "sorted"
  | "checkboxColumnHead";

export interface CellAction {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface CellProps {
  /** Defaults to `"text"`. See the type-specific props below for what each one needs. */
  type?: CellType;
  /**
   * Primary content — the value itself for `text`/`numeric`/`emphasis`,
   * arbitrary content for `slot`, a button's label for `button`, a
   * pill's text for `label`, a header's label for `columnHead`/`sorted`,
   * and the primary line for `double`/`avatar`. Ignored (and not needed)
   * by `null` (always renders "—") and `loading` (always renders a
   * skeleton bar).
   */
  children?: ReactNode;
  /** `double` only — the second, subdued line under `children`. */
  secondary?: ReactNode;
  /** `progress` only — 0–100. */
  value?: number;
  /** `progress` only — formats the trailing value text. Defaults to `${value}%`. */
  formatValue?: (value: number) => string;
  /** `avatar` only — same as `<Avatar>`'s own props (`children` is the primary label, separate from these). */
  name?: AvatarProps["name"];
  src?: AvatarProps["src"];
  initials?: AvatarProps["initials"];
  /** `avatar` only — same as `<Avatar>`'s own `color`. Defaults to `<Avatar>`'s own default ("info") if omitted. */
  color?: AvatarProps["color"];
  /** `avatar` only — the subdued second line under `children`. */
  sublabel?: ReactNode;
  /** `checkbox` / `checkboxColumnHead` only. */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** `checkbox` / `checkboxColumnHead` only — required, since the checkbox has no visible label of its own. */
  "aria-label"?: string;
  /** `button` / `checkbox` / `checkboxColumnHead` only. */
  disabled?: boolean;
  /** `button` only, or `avatar` — makes the row head itself clickable (e.g. opening a detail view), rendered as a real `<button>` rather than a `<div>`. Omit for a plain, non-interactive avatar cell. */
  onClick?: () => void;
  /** `icon` only — up to 3 row-action buttons, right-aligned. */
  actions?: CellAction[];
  /** `icon` only — an optional trailing count (e.g. attachment count). */
  count?: ReactNode;
  /** `sorted` only. Defaults to `"asc"`. */
  direction?: "asc" | "desc";
  className?: string;
}

const formatPercent = (value: number) => `${value}%`;

/**
 * The contents of one table cell — matches Figma's Cell exactly, all 16
 * `type`s (Figma's own "Type" variant axis) implemented as one component
 * rather than 16, since that's how the design system itself models it.
 * `columnHead`/`sorted`/`checkboxColumnHead` are the header-row versions —
 * same component, not a separate one, since Figma treats them as more
 * `Cell` types rather than a distinct component.
 *
 * Several types compose other real components rather than reimplementing
 * their look: `progress` → `<ProgressBar>`, `avatar` → `<Avatar>`,
 * `checkbox`/`checkboxColumnHead` → `<Checkbox>`, `button` → `<Button
 * variant="secondary" size="sm">`. `slot` is the escape hatch for content
 * that doesn't fit any of the other 15 — a single flexible child.
 *
 * Not implemented: Figma's "Input" cell type reuses a component explicitly
 * named (and marked) "Deprecated" in the source file — reproducing a
 * deprecated pattern as if it were current didn't seem right. Use `slot`
 * with a real `<TextInput size="sm">`/`<Select size="sm">` for an
 * inline-editable cell instead.
 */
export function Cell({
  type = "text",
  children,
  secondary,
  value = 0,
  formatValue = formatPercent,
  name,
  src,
  initials,
  color,
  sublabel,
  checked,
  onCheckedChange,
  disabled = false,
  onClick,
  actions = [],
  count,
  direction = "asc",
  className,
  "aria-label": ariaLabel,
}: CellProps) {
  const isHeader = type === "columnHead" || type === "sorted" || type === "checkboxColumnHead";

  return (
    <div
      className={clsx(
        "ds-cell",
        isHeader && "ds-cell--header",
        (type === "numeric" || type === "checkbox" || type === "icon") && "ds-cell--end",
        className,
      )}
    >
      {type === "text" && <span className="ds-cell__text">{children}</span>}

      {type === "numeric" && <span className="ds-cell__text">{children}</span>}

      {type === "emphasis" && <span className={clsx("ds-cell__text", "ds-cell__text--emphasis")}>{children}</span>}

      {type === "null" && <span className={clsx("ds-cell__text", "ds-cell__text--null")}>—</span>}

      {type === "loading" && <span className="ds-cell__skeleton" aria-hidden />}

      {type === "slot" && <div className="ds-cell__slot">{children}</div>}

      {type === "double" && (
        <div className="ds-cell__double">
          <span className="ds-cell__double-primary">{children}</span>
          <span className="ds-cell__double-secondary">{secondary}</span>
        </div>
      )}

      {type === "progress" && (
        <div className="ds-cell__progress">
          <ProgressBar className="ds-cell__progress-bar" value={value} showValue={false} />
          <span className="ds-cell__progress-value">{formatValue(value)}</span>
        </div>
      )}

      {type === "label" && <span className="ds-cell__label">{children}</span>}

      {type === "button" && (
        <Button variant="secondary" size="sm" onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      )}

      {type === "avatar" && (() => {
        const AvatarRow = onClick ? "button" : "div";
        return (
          <AvatarRow
            type={onClick ? "button" : undefined}
            className={clsx("ds-cell__avatar-row", onClick && "ds-cell__avatar-row--button")}
            onClick={onClick}
          >
            <Avatar size="xs" name={name} src={src} initials={initials} color={color} />
            <div className="ds-cell__avatar-text">
              <span className="ds-cell__avatar-label">{children}</span>
              {sublabel && <span className="ds-cell__avatar-sublabel">{sublabel}</span>}
            </div>
          </AvatarRow>
        );
      })()}

      {(type === "checkbox" || type === "checkboxColumnHead") && (
        <Checkbox checked={checked} onChange={(event) => onCheckedChange?.(event.target.checked)} disabled={disabled} aria-label={ariaLabel} />
      )}

      {type === "icon" && (
        <div className="ds-cell__actions">
          {actions.slice(0, 3).map((action, index) => (
            <button
              key={index}
              type="button"
              className="ds-cell__icon-button"
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
          {count !== undefined && <span className="ds-cell__count">{count}</span>}
        </div>
      )}

      {type === "columnHead" && <span className="ds-cell__head-label">{children}</span>}

      {type === "sorted" && (
        <div className="ds-cell__sort">
          {direction === "asc" ? <ArrowUp size={16} aria-hidden /> : <ArrowDown size={16} aria-hidden />}
          <span className="ds-cell__sort-label">{children}</span>
        </div>
      )}
    </div>
  );
}
