import type { ReactNode } from "react";
import { clsx } from "clsx";
import { AppIcon } from "../AppIcon";
import type { AppIconName } from "../AppIcon";
import { Tabs, TabList } from "../Tabs";
import "./MobileAppHeader.css";

export interface MobileAppHeaderProps {
  /**
   * Which app tile to show — an `AppIconName` reuses `<AppIcon>` directly
   * (at the smaller size this header's confirmed Figma instance scales it
   * to). `AppIcon`'s own name enum is closed to whatever apps Figma has
   * actually designed a glyph for, so pass a `ReactNode` instead for
   * anything else — typically a `.ds-mobile-app-header__icon`-sized icon
   * of your own in the same tile styling, rather than forcing a
   * misleading `AppIconName` that doesn't really represent your app.
   */
  icon: AppIconName | ReactNode;
  title: ReactNode;
  /** `<Tab>`s for this header's own `<TabList>` — same component `<Tabs>` uses elsewhere. There's no paired `<TabPanel>` here: the sub-page content these tabs switch between lives in the page below the header, driven by the same `value`/`onValueChange`, not inside this component. */
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Trailing icon button(s) — Figma's own example reserves this slot but hides it by default (nothing to show there in that instance), so it's optional here too. */
  actions?: ReactNode;
  className?: string;
}

/**
 * A mobile page header: a branded app icon + title, a row of tabs for
 * switching between that page's sub-views, and an optional trailing
 * action — matches Figma's MobileAppHeader exactly. Nothing about the
 * icon or tabs is reimplemented: the icon is `<AppIcon>` (confirmed as a
 * scaled-down instance of the same component — Figma's own 4.8px corner
 * radius is exactly `<AppIcon>`'s usual 8px at the 0.6× scale from 40px
 * down to this header's 24px, not a distinct token), and the tabs are
 * `<Tabs>`/`<TabList>`/`<Tab>` — confirmed color-for-color identical to
 * their existing styling (unselected `content-brand-primary`, selected
 * `content-base`, the sliding `border-brand` indicator).
 *
 * `overflow-x: auto` on the tab row is this component's own addition, not
 * something the static Figma frame could specify — a real phone screen can
 * easily have more tabs than fit, so they scroll horizontally rather than
 * wrapping or overflowing the header.
 */
export function MobileAppHeader({ icon, title, children, value, defaultValue, onValueChange, actions, className }: MobileAppHeaderProps) {
  return (
    <header className={clsx("ds-mobile-app-header", className)}>
      <div className="ds-mobile-app-header__row">
        <div className="ds-mobile-app-header__title-group">
          {typeof icon === "string" ? <AppIcon app={icon as AppIconName} className="ds-mobile-app-header__icon" /> : icon}
          <span className="ds-mobile-app-header__title">{title}</span>
        </div>

        <Tabs value={value} defaultValue={defaultValue} onValueChange={onValueChange} className="ds-mobile-app-header__tabs">
          <TabList className="ds-mobile-app-header__tab-list">{children}</TabList>
        </Tabs>

        {actions && <div className="ds-mobile-app-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
