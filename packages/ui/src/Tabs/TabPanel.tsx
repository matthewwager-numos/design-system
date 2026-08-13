import type { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { useTabsContext } from "./TabsContext";

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Matched against <Tabs>'s value — this panel only renders while its <Tab> is selected. */
  value: string;
}

/** Content paired with a <Tab> of the same `value`. Unmounted (not just visually hidden) while its tab isn't selected. */
export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const { value: activeValue, baseId } = useTabsContext("TabPanel");
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={clsx("ds-tab-panel", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
