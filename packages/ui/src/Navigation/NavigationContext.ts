import { createContext, useContext } from "react";

export interface NavigationContextValue {
  expanded: boolean;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigationContext(component: string): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Navigation>`);
  }
  return ctx;
}
