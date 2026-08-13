import { createContext, useContext } from "react";

export interface SegmentedControlContextValue {
  value: string;
  setValue: (value: string) => void;
}

export const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

export function useSegmentedControlContext(component: string): SegmentedControlContextValue {
  const ctx = useContext(SegmentedControlContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <SegmentedControl>`);
  }
  return ctx;
}
