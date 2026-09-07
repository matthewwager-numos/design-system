import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { AppIcon } from "../AppIcon";
import type { AppIconName } from "../AppIcon";
import { Tabs, TabList } from "../Tabs";
import type { TabProps } from "../Tabs";
import "./MobileAppHeader.css";

function firstTabValue(children: ReactNode): string | undefined {
  const first = Children.toArray(children)[0];
  return isValidElement<TabProps>(first) ? first.props.value : undefined;
}

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
  /**
   * Called when the icon is tapped, in addition to its own built-in
   * behavior: scrolling the title/tabs strip back to the start, and
   * selecting the first `<Tab>` (by DOM order, not necessarily one named
   * "overview" or similar — pass `onIconClick` too if the tab you want
   * selected isn't actually the first one).
   */
  onIconClick?: () => void;
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
 * The icon is the one thing that never scrolls — the title and the tabs
 * scroll together as a single strip beside it, so a long title doesn't
 * quietly disappear off-screen the way it would if only the tabs scrolled.
 * A separator line between the title and the tabs rides along with that
 * scroll too, at first — but it's `position: sticky`, so once it reaches
 * the scroll container's own edge (a fixed 8px right of the icon) it
 * anchors there instead of continuing, and the title (ahead of it) and
 * tabs (behind it) keep scrolling independently past that fixed point —
 * see `.ds-mobile-app-header__separator` in the CSS for the mechanics.
 *
 * Tapping the icon scrolls that strip back to the start (animated, real
 * `scrollTo({ behavior: "smooth" })`, not a CSS transition — there's no
 * single property to transition when the thing moving is scroll position),
 * selects the first tab, and calls `onIconClick`, if given, for anything
 * else the page wants to do. Since selecting a specific tab needs a
 * concrete value to select even when this component is used uncontrolled,
 * `MobileAppHeader` tracks that value itself (the same controlled/
 * uncontrolled duality `<Tabs>` itself has) and always drives the nested
 * `<Tabs>` in controlled mode, rather than leaving `<Tabs>` to manage its
 * own internal state where `MobileAppHeader` couldn't reach it.
 *
 * A soft edge fade (a `mask-image`, toggled by real scroll position via
 * `data-fade-start`/`data-fade-end`, not always-on) hints there's more to
 * scroll to in whichever direction actually has more.
 */
export function MobileAppHeader({
  icon,
  title,
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onIconClick,
  actions,
  className,
}: MobileAppHeaderProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolledValue;

  function setValue(next: string) {
    setUncontrolledValue(next);
    onValueChange?.(next);
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  const [fadeStart, setFadeStart] = useState(false);
  const [fadeEnd, setFadeEnd] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function updateFade() {
      // 1px tolerance — subpixel layout can leave scrollLeft/scrollWidth a
      // hair off an exact match, which would otherwise flicker the fade.
      setFadeStart(el!.scrollLeft > 1);
      setFadeEnd(el!.scrollLeft + el!.clientWidth < el!.scrollWidth - 1);
    }

    updateFade();
    el.addEventListener("scroll", updateFade, { passive: true });
    const observer = new ResizeObserver(updateFade);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFade);
      observer.disconnect();
    };
    // Re-measure whenever the tabs themselves change — a resize of the
    // scroll container's own box doesn't fire for that on its own, since
    // overflow: auto absorbs internal content changes without changing the
    // container's box.
  }, [children]);

  function handleIconClick() {
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    const first = firstTabValue(children);
    if (first !== undefined) setValue(first);
    onIconClick?.();
  }

  return (
    <header className={clsx("ds-mobile-app-header", className)}>
      <div className="ds-mobile-app-header__row">
        <button type="button" className="ds-mobile-app-header__icon-button" onClick={handleIconClick} aria-label="Back to overview">
          {typeof icon === "string" ? <AppIcon app={icon as AppIconName} className="ds-mobile-app-header__icon" /> : icon}
        </button>

        <div ref={scrollRef} className="ds-mobile-app-header__scroll" data-fade-start={fadeStart} data-fade-end={fadeEnd}>
          <span className="ds-mobile-app-header__title">{title}</span>
          <div className="ds-mobile-app-header__separator" aria-hidden="true" />

          <Tabs value={value} onValueChange={setValue} className="ds-mobile-app-header__tabs">
            <TabList className="ds-mobile-app-header__tab-list">{children}</TabList>
          </Tabs>

          <div className="ds-mobile-app-header__fade ds-mobile-app-header__fade--start" aria-hidden="true" />
          <div className="ds-mobile-app-header__fade ds-mobile-app-header__fade--end" aria-hidden="true" />
        </div>

        {actions && <div className="ds-mobile-app-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
