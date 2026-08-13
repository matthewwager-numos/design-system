import { useId, useState } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { TabsContext } from "./TabsContext";
import type { TabsOrientation } from "./TabsContext";
import "./Tabs.css";

export interface TabsProps {
  children: ReactNode;
  /** "horizontal" matches Figma's "Inline" (a row, underlined when selected); "vertical" matches "Stacked" (a column, left-bordered when selected). */
  orientation?: TabsOrientation;
  /** Controlled selected tab value — must match a <Tab>'s `value`. Omit to let Tabs manage its own selection. */
  value?: string;
  /** Initial selection for uncontrolled use. There's no selection at all (and no <TabPanel> renders) until one of these is set. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * Root of a tabbed interface — tracks which tab is selected and shares it
 * with <TabList>/<Tab>/<TabPanel> via context. Matches Figma's Tabs
 * component set, plus the real interactive behavior Figma doesn't specify:
 * roving-tabindex keyboard navigation and a real `<button role="tab">` /
 * `role="tabpanel"` pairing (see <TabList>/<Tab>/<TabPanel>).
 */
export function Tabs({ children, orientation = "horizontal", value: controlledValue, defaultValue, onValueChange, className }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolledValue;
  const baseId = useId();

  function setValue(next: string) {
    setUncontrolledValue(next);
    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider value={{ value, setValue, orientation, baseId }}>
      <div className={clsx("ds-tabs", `ds-tabs--${orientation}`, className)}>{children}</div>
    </TabsContext.Provider>
  );
}
