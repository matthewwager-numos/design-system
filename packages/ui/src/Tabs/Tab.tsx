import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { useTabsContext } from "./TabsContext";

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Matched against <Tabs>'s value to determine selection, and against a <TabPanel>'s `value` to pair them. */
  value: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** A count/status pill — Figma's optional "Badge" (e.g. an unread count). */
  badge?: ReactNode;
}

/**
 * One tab trigger. Renders as a real `<button role="tab">` — Enter/Space
 * activation comes free from native button semantics; <TabList> handles
 * arrow-key navigation between tabs. `disabled` isn't part of Figma's Tab
 * component set (no Disabled state is defined there) — it's an addition,
 * styled with `--content-disabled` to match the rest of this library.
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, leadingIcon, trailingIcon, badge, className, children, disabled, onClick, ...rest },
  ref,
) {
  const { value: activeValue, setValue, baseId } = useTabsContext("Tab");
  const selected = value === activeValue;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={selected}
      data-tab-value={value}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={clsx("ds-tab", selected && "ds-tab--selected", className)}
      onClick={(event) => {
        onClick?.(event);
        setValue(value);
      }}
      {...rest}
    >
      {leadingIcon ? (
        <span className="ds-tab__icon" aria-hidden>
          {leadingIcon}
        </span>
      ) : null}
      <span className="ds-tab__label">{children}</span>
      {badge != null ? <span className="ds-tab__badge">{badge}</span> : null}
      {trailingIcon ? (
        <span className="ds-tab__icon" aria-hidden>
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
});
