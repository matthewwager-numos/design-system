import { createContext, useContext } from "react";

export type TabsOrientation = "horizontal" | "vertical";

export interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: TabsOrientation;
  baseId: string;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Tabs>`);
  }
  return ctx;
}
