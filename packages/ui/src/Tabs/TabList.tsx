import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent } from "react";
import { clsx } from "clsx";
import { useTabsContext } from "./TabsContext";

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Wraps a row (horizontal) or column (vertical) of <Tab>s. Implements the
 * WAI-ARIA "automatic activation" pattern: arrow keys move focus AND select
 * the newly focused tab, matching how most real tab strips behave (as
 * opposed to <DropdownMenu>'s menu items, where arrows only move focus).
 *
 * Also owns the selected-tab indicator: a single absolutely-positioned bar
 * measured off the selected `<Tab>`'s own box and re-positioned via CSS
 * transition whenever selection changes — so it slides from the previously
 * selected tab to the newly selected one, and fades in on first selection,
 * instead of the indicator instantly teleporting.
 */
export function TabList({ className, children, onKeyDown, ...rest }: TabListProps) {
  const { orientation, value, setValue } = useTabsContext("TabList");
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const selected = listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!selected) {
        setIndicatorStyle(null);
        return;
      }
      setIndicatorStyle(
        orientation === "horizontal"
          ? { transform: `translateX(${selected.offsetLeft}px)`, width: selected.offsetWidth }
          : { transform: `translateY(${selected.offsetTop}px)`, height: selected.offsetHeight },
      );
    }
    measure();
    // Selecting a tab can't change layout on its own, but the window
    // resizing (or the list reflowing for any other reason) can move the
    // selected tab without changing `value` — re-measure so the indicator
    // doesn't end up pointing at stale coordinates.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value, orientation]);

  function getTabs() {
    return Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []);
  }

  function activate(tabs: HTMLButtonElement[], index: number) {
    const tab = tabs[index];
    if (!tab) return;
    tab.focus();
    setValue(tab.dataset.tabValue ?? "");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    const tabs = getTabs();
    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        activate(tabs, (currentIndex + 1) % tabs.length);
        break;
      case prevKey:
        event.preventDefault();
        activate(tabs, (currentIndex - 1 + tabs.length) % tabs.length);
        break;
      case "Home":
        event.preventDefault();
        activate(tabs, 0);
        break;
      case "End":
        event.preventDefault();
        activate(tabs, tabs.length - 1);
        break;
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      className={clsx("ds-tab-list", `ds-tab-list--${orientation}`, className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
      <span
        className={clsx("ds-tab-list__indicator", indicatorStyle && "ds-tab-list__indicator--visible")}
        style={indicatorStyle ?? undefined}
        aria-hidden
      />
    </div>
  );
}
